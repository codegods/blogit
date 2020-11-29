import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions", "docs", "frontend"]
    else "."
)

sys.path.append(PROJECT_ROOT)

import json
import base64
import signal
import logging
import platform
import subprocess
from typing import Union, Dict
from helpers.init_console import init
from helpers import formatter, config_loader

init()
logfile = formatter.init(PROJECT_ROOT)
logger = logging.getLogger("startScript")


def find_package_manager() -> str:
    """
    Returns the node package manager installed in the system.
    It tries to search for `yarn` and if it was found then it returns
    `yarn` otherwise returns `npm`
    """
    try:
        subprocess.Popen(["yarn", "--version"], stdout=subprocess.PIPE).wait()
        return "yarn"
    # It will raise a file not found error if yarn is not found
    except FileNotFoundError:
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
    class that don't start with '__' and returns a base64 encoded json
    string.
    """
    final_dict = {}
    for attr in dir(obj):
        if not attr.startswith("__") and not callable(getattr(obj, attr)):
            final_dict[attr] = getattr(obj, attr)
    return base64.b64encode(json.dumps(final_dict).encode()).decode("utf-8")


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
                os.path.join(PROJECT_ROOT, "scripts", "find_default_terminal.sh"),
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

    # Got to set this property for flask to start in correct mode
    config.flask.MODE = config.MODE
    if config.MODE == "production":
        proc = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "main",
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

            # Send shutdown signal to server
            if platform.system().lower() == "windows":
                proc.send_signal(signal.SIGBREAK)
            else:
                proc.send_signal(signal.SIGINT)

            # Wait for a graceful shutdown
            proc.wait()
            logger.info("Shutted down.")


def gunicorn():
    """Utility function to run the app with gunicorn"""
    import main

    config = config_loader.main()
    config.MODE = "production"
    config.flask.MODE = config.MODE
    return main.create_app(config.flask, config.mysql)


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
            env = finalize_wds_config(config)
            env.update(os.environ)
            subprocess.Popen(
                ["cmd.exe", "/C", f"start {pkg_manager} start"],
                cwd=os.path.join(PROJECT_ROOT, "frontend"),
                env=env,
            ).wait()

        else:
            logger.warn("Unable to start webpack dev server. Please start it manually.")

    start_flask(config)


if __name__ == "__main__":
    main()
