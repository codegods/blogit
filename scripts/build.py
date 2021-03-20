import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in [
        "lib",
        "api",
        "helpers",
        "scripts",
        "tests",
        "extensions",
        "docs",
        "frontend",
    ]
    else "."
)

sys.path.append(PROJECT_ROOT)

import time
import shlex
import subprocess
from logging import getLogger
from collections import namedtuple
from helpers.formatter import init
from typing import Dict, List, NoReturn, Union
from helpers.init_console import init as scr_init
from helpers.config_loader import main as load_config, ConfigTemplate

# A named tuple to store the output from a process
Result = namedtuple("Result", ["stdout", "stderr", "exit_code"])


class _Terminal:
    """
    Executes the required commands in a subprocess on unix like
    operating systems
    """

    def _execute(
        self, commands: Union[str, List[str]], *rest_pos, **rest_kwd
    ) -> subprocess.Popen:
        """The actual function that executes the commands"""
        return subprocess.Popen(
            args=commands,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            *rest_pos,
            **rest_kwd,
        )

    execute = _execute


class _WinTerminal(_Terminal):
    """
    Executes the required commands in a command prompt on Windows
    Operating System
    """

    def execute(self, commands: Union[str, List[str]], *rest_pos, **rest_kwd):
        if type(commands == str):
            commands = ["cmd.exe", "/C", commands]
        elif type(commands == list):
            commands = ["cmd.exe", "/C", f"{shlex.join(commands)}"]
        else:
            raise TypeError(
                "`commands` must be a list or string, but got " + str(type(commands))
            )
        return super()._execute(commands, *rest_pos, **rest_kwd)


def failed_process(
    proc: str, res: Result, more_info: Union[str, None] = None
) -> NoReturn:
    """Function to log build failures"""
    logger.critical(
        f"The {proc} build process exited with a non-zero exit code."
        + f"\nAdditional info: {more_info or 'None'}"
        + f"\nExit code: \x1b[31m{res.exit_code}\x1b[0m"
    )
    logger.critical(
        "\nOutput from process' stdout:\n\n"
        + f"\x1b[37m========= OUTPUT FROM \x1b[34m{proc}::stdout\x1b[37m =========\x1b[0m\n"
        + res.stdout
        + "\n\x1b[37m========= OUTPUT END =========\x1b[0m"
    )
    logger.critical(
        "\nOutput from process' stderr:\n\n"
        + f"\x1b[37m========= OUTPUT FROM \x1b[34m{proc}::stderr\x1b[37m =========\x1b[0m\n"
        + res.stderr
        + "\n\x1b[37m========= OUTPUT END =========\x1b[0m"
    )
    logger.info("This error is critical. Aborting build process...")
    exit(res.exit_code)


def webpack_build(cfg: object) -> Result:
    logger.info("Preparing environment variables for Webpack build...")
    env: Dict[str, str] = {}
    for k, v in cfg.__dict__.items():
        env[k] = v
    env["NODE_ENV"] = "production"
    logger.info("Starting webpack build...")
    proc = Terminal.execute(
        commands=["yarn", "build"], env=env, cwd=os.path.join(PROJECT_ROOT, "frontend")
    )
    logger.info("Webpack build started. Waiting for compilation to complete...")
    t1 = time.time()
    proc.wait()
    t2 = time.time()
    if proc.returncode != 0:
        return Result(
            proc.stdout.read().decode(), proc.stderr.read().decode(), proc.returncode
        )
    logger.info(f"Webpack build finished successfully in \x1b[32m{t2-t1}s\x1b[0m.")
    return Result("", "", 0)


def docker_build() -> Result:
    logger.info("Starting docker build...")
    args = []
    if "--" in sys.argv:
        args = sys.argv[sys.argv.index("--") + 1 :]  # noqa: E203
    proc = Terminal.execute(
        commands=[
            "docker",
            "build",
            ".",
            "-f",
            os.path.join(PROJECT_ROOT, "dockerfile"),
            *args,
        ],
        cwd=PROJECT_ROOT,
    )
    logger.info("Docker build started. Waiting for compilation to complete...")
    t1 = time.time()
    proc.wait()
    t2 = time.time()
    if proc.returncode != 0:
        return Result(
            proc.stdout.read().decode(), proc.stderr.read().decode(), proc.returncode
        )
    logger.info(f"Docker build finished successfully in \x1b[32m{t2-t1}s\x1b[0m.")
    return Result("", "", 0)


def main():
    # Activate production mode
    os.environ["BLOGIT_MODE"] = "1"
    config: Union[ConfigTemplate, None] = None

    # Allow setting config file from cli
    if "--config-file" in sys.argv:
        config = load_config(sys.argv[sys.argv.index("--config-file") + 1])
    else:
        config = load_config()

    if "--skip-wp-build" not in sys.argv:
        result = webpack_build(config.wds)
        if result.exit_code != 0:
            failed_process(
                "webpack",
                result,
                "This indicates some error while compiling frontend code.",
            )
    else:
        logger.warning(
            "Skipping webpack build because \x1b[36m--skip-wp-build\x1b[0m flag is supplied"
        )

    if "--docker" in sys.argv:
        result = docker_build()
        if result.exit_code != 0:
            failed_process(
                "docker",
                result,
                "This indicates some error while building container.",
            )
    logger.info("All builds completed, exiting...")


Terminal = (_WinTerminal if sys.platform == "win32" else _Terminal)()

if __name__ == "__main__":
    init(PROJECT_ROOT)
    scr_init()
    logger = getLogger("builder")
    main()
