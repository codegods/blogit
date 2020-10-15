import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions"]
    else "."
)

sys.path.append(PROJECT_ROOT)

import json
import signal
import platform
import subprocess
from typing import Union, Dict
from colorama import init
from helpers import formatter, config_loader

init()
logfile = formatter.init(PROJECT_ROOT)
logger = formatter.getLogger("startScript")


def find_package_manager() -> str:
    """
    Returns the node package manager installed in the system.
    It tries to search for `yarn` and if it was found then it returns
    `yarn` otherwise returns `npm`
    """
    exit_code = subprocess.Popen(["yarn", "--version"], stdout=subprocess.PIPE).wait()
    if exit_code == 0:
        return "yarn"
    else:
        return "npm"


def finalize_wds_config(config: config_loader.ConfigTemplate) -> Dict[str, str]:
    """
    Converts the WDS configuration object to a dictionary that can be
    passed as environment variables to WDS process.
    """
    final = {}
    for i in dir(config.wds):
        if not i.startswith("__") and not callable(getattr(config.wds, i)):
            final[i] = str(getattr(config.wds, i))

    # The WDS will need these in order to proxy API calls
    final["FLASK_HOST"] = str(config.flask.HOST)
    final["FLASK_PORT"] = str(config.flask.PORT)
    return final


def serialize(obj: object) -> str:
    """
    Serializes a given object. It will find all the attributes of the
    class that don't start with '__' and returns a json string.
    """
    _d = {}
    for attr in dir(obj):
        if not attr.startswith("__") and not callable(getattr(obj, attr)):
            _d[attr] = getattr(obj, attr)
    return json.dumps(_d)


def open_wds_in_linux(config: config_loader.ConfigTemplate, pkg_manager: str) -> None:
    """
    This attempts to start the WDS server in a new terminal process.
    If it fails to do so, it will show a warning to the user.
    """
    logger.info("Attempting to find default terminal...")
    # Attempt to find the default terminal
    env = finalize_wds_config(config)
    env.update(os.environ)
    default_terminal = (
        subprocess.Popen(
            [
                "/bin/bash",
                os.path.join(PROJECT_ROOT, "lib", "find_default_terminal.sh"),
                f"{pkg_manager} start",
            ],
            stdout=subprocess.PIPE,
            cwd=os.path.join(PROJECT_ROOT, "frontend"),
            env=env,
        )
        .communicate()[0]
        .decode("utf-8")
        .replace("\n", "")
    )

    if default_terminal:
        logger.info(f"Using terminal \x1b[93m{ default_terminal }\x1b[m")
    else:
        logger.warn("Failed to detect terminal")
        print(
            'Please open a new terminal (or a new tab) and run "'
            + f"\x1b[96m{ 'cd frontend && ' + pkg_manager + ' start' }\x1b[m in it"
        )


def start_flask(config: config_loader.ConfigTemplate) -> None:
    """
    Attempts to start flask server in a subprocess and waits for it to end
    """
    logger.info("Attempting to start flask server...")
    proc: Union[subprocess.Popen, None] = None
    if config.MODE == "production":
        proc = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "main",
                "--mode",
                "production",
                "--log-file",
                logfile,
                "--flask-config",
                serialize(config.flask),
                "--mysql-config",
                serialize(config.mysql),
            ]
        )
    elif config.RUN_FLASK_IN_DEVELOPMENT:
        proc = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "main",
                "--mode",
                "development",
                "--log-file",
                logfile,
                "--flask-config",
                serialize(config.flask),
                "--mysql-config",
                serialize(config.mysql),
            ]
        )
    if proc is not None:
        try:
            proc.wait()
        except KeyboardInterrupt:
            logger.info("Waiting for server to shutdown...")
            if platform.system().lower() == "windows":
                proc.send_signal(signal.CTRL_C_EVENT)
            else:
                proc.send_signal(signal.SIGTERM)

            proc.wait()
            logger.info("Shutted down.")


def main() -> None:
    """
    Loads the configration files and then attempts to start the
    WDS and flask processes accordingly.
    """
    config: Union[config_loader.ConfigTemplate, None] = None

    # Allow setting config file from cli
    if "--config-file" in sys.argv:
        config = config_loader.main(sys.argv[sys.argv.index("--config-file") + 1])
    else:
        config = config_loader.main()

    if config.MODE == "development" and config.RUN_WDS_IN_DEVELOPMENT:
        pkg_manager = find_package_manager()

        logger.info(f"Using \x1b[32m{ pkg_manager }\x1b[m package manager...")
        if platform.system().lower() == "linux":
            open_wds_in_linux(config, pkg_manager)

        elif platform.system().lower() == "windows":
            logger.info("Attempting to start webpack dev server...")
            subprocess.Popen(
                ["start", pkg_manager, "start"],
                cwd=os.path.join(PROJECT_ROOT, "frontend"),
                env=finalize_wds_config(config),
            )
        else:
            logger.warn("Unable to start webpack dev server. Please start it manually.")

        start_flask(config)


if __name__ == "__main__":
    main()
