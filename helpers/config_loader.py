"""
This module attempts to find, load, parse and validate the
configuration for the app. It can load config from a python file, a
json file, a dictionary or a validd json string.
By default it will search for 'config.py', 'config.json' and a
'.config' file in that order and will parse the first file found.
Although the config file can be changed by specifying the
`config_file` parameter in the main function.
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions", "docs", "frontend"]
    else "."
)

sys.path.append(PROJECT_ROOT)
del sys

import re
import json
import logging
import traceback
import importlib.util
from helpers import formatter
from typing import Any, NoReturn, Optional, Union

global logger
logger: formatter.logging.Logger


class UnknownOption(Exception):
    """
    This error is raised when the user tries to define an option in configuration.
    """

    pass


class MissingOption(Exception):
    """
    Raised when a required option is missing in the configuration
    """

    pass


class ConfigTemplate:
    """
    This class represents a template for the configration files.
    It is used mainly for typechecking.
    """

    flask: object
    wds: object
    mysql: object
    MODE: str
    PKG_MANAGER: str
    RUN_WDS_IN_DEVELOPMENT: bool
    RUN_FLASK_IN_DEVELOPEMNT: bool


class ConfigFromJson(ConfigTemplate):
    def load(self, json: dict) -> None:
        """
        Converts all the json configuration to a class.
        """
        for i in json:
            if isinstance(json[i], dict):
                if i not in vars(self):
                    setattr(self, i, object())
                for j in json[i]:
                    setattr(getattr(self, i), j, json[i][j])
            else:
                setattr(self, i, json[i])


def validate(config: Any) -> None:
    """
    Validates a given configuration object.

    :param config: The configuration object
    :returns: None
    :raises MissingOption: If a required option is missing.
    :raises UnknownOption: If there is an unknown option in the configuration.
    :raises FileNotFoundError: If the ssl key and crt files were not found.
    """
    checklist = {
        "required": {
            "root": [
                "flask",
                "wds",
                "mysql",
                "MODE",
                "RUN_WDS_IN_DEVELOPMENT",
                "RUN_FLASK_IN_DEVELOPMENT",
            ],
            "flask": ["HOST", "PORT", "config"],
            "wds": ["HOST"],
            "mysql": ["USER", "PASSWORD"],
        },
        "optional": {
            "wds": [
                "HTTPS",
                "SHOULD_USE_SOURCE_MAP",
                "IMAGE_INLINE_SIZE_LIMIT",
                "DANGEROUSLY_DISABLE_HOST_CHECK",
                "NODE_PATH",
                "NODE_ENV",
                "WDS_SPCKET_HOST",
                "WDS_SPCKET_PATH",
                "WDS_SPCKET_PORT",
                "SSL_KEY_FILE",
                "SSL_CRT_FILE",
            ],
            "mysql": ["AUTH_PLUGIN", "HOST"],
            "flask": ["ENABLE_CACHING_IN_DEVELOPMENT"]
        },
    }

    # Check for missing required options
    for kind in checklist["required"]:
        prop = config if kind == "root" else getattr(config, kind)
        for val in checklist["required"][kind]:
            if not hasattr(prop, val):
                logger.error(
                    "Error while parsing config: "
                    + f"`{prop}.{val}` is a required config "
                )
                raise MissingOption(
                    "Error while parsing config: "
                    + f"`{prop}.{val}` is a required config "
                    + "option but is not specified in the configuration file."
                )

    def unknown_option(option: str) -> NoReturn:
        logger.error("Error while parsing config: Found an unknown option: " + option)
        raise UnknownOption(
            "Error while parsing config: Found an unknown option: " + option
        )

    # Check for unknown options
    for val in dir(config):

        # Ignore built-in properties and methods like __init__, __dict__, __str__, etc
        # Also ignore callables and "required" options
        if (
            not re.match("__[a-zA-Z0-9_]*__", val)
            and not callable(getattr(config, val))
            and val not in checklist["required"]["root"]
        ):
            if val in checklist["optional"]:
                for ch_val in vars(val):
                    if not re.match("__[a-zA-Z0-9_]*__", ch_val) and not callable(
                        ch_val
                    ):
                        if ch_val not in checklist["optional"][val]:
                            unknown_option(f"Config.{val}.{ch_val}")
            else:
                unknown_option(f"Config.{val}")

    # Check for illegal options
    if config.wds.HTTPS == "true":

        # HTTPS was set to true but no cert file was specified
        if not hasattr(config.wds, "SSL_KEY_FILE") or not hasattr(
            config.wds, "SSL_CRT_FILE"
        ):
            logger.error(
                "config.wds.HTTPS was set to True without specifying a key file and a crt file, which is illegal"
            )
            raise MissingOption(
                "config.wds.HTTPS was set to True without specifying a key file and a crt file, which is illegal"
            )
        else:

            # Files were specified but are non-existent
            if not os.path.exists(config.wds.SSL_KEY_FILE):
                raise FileNotFoundError(
                    f"The file at { config.wds.SSL_KEY_FILE } was set as the key file"
                    + "in configuration but was not found."
                )
            if not os.path.exists(config.wds.SSL_CRT_FILE):
                raise FileNotFoundError(
                    f"The file at { config.wds.SSL_CRT_FILE } was set as the certificate file"
                    + "in configuration but was not found."
                )


def load_from_class(config: object) -> ConfigTemplate:
    """
    Loads the configuration from a given class by calling its `load`
    method and then validates it.
    """

    # Load the mode from environment variable and
    # if it is not specified use development mode
    MODE = int(os.environ.get("BLOGIT_MODE", -1))
    conf: ConfigTemplate

    try:
        conf = config.Config()
        conf.load(PROJECT_ROOT, MODE)
    except Exception:
        logger.critical("Fatal: There was an error while parsing the config.py file:")
        traceback.print_exc()
        print("This error is non-recoverable. Aborting...")
        exit(1)

    logger.info("Validating configuration...")
    validate(conf)
    logger.info("Configuration OK")
    MODE = {
        -1: "development",
        0: "testing",
        1: "production",
    }[MODE]
    conf.MODE = os.environ["FLASK_ENV"] = os.environ["NODE_ENV"] = MODE
    return conf


def load_from_pyfile(file: str = "config.py") -> ConfigTemplate:
    """
    This loads the configuration from a `config.py` file located in the project root
    :param file: ( str ) The name of the file
    :param root: ( str ) The project's root
    """
    file = os.path.join(PROJECT_ROOT, file)

    logger.info(f"Loading config from \x1b[32m{file}\x1b[m")

    # Load the config file
    spec = importlib.util.spec_from_file_location("", file)
    config = importlib.util.module_from_spec(spec)

    # Execute the script
    spec.loader.exec_module(config)
    return load_from_class(config)


def load_from_json(file="config.json") -> ConfigTemplate:
    """
    This loads the configuration from a `config.json` file located in the project root
    :param file: ( str ) The name of the file
    :param root: ( str ) The root directory of the project
    """
    config_file = os.path.join(PROJECT_ROOT, file)
    logger.info(f"Loading config from \x1b[32m{config_file}\x1b[m")
    with open(config_file) as f:
        conf = json.loads(f.read())
        config = ConfigFromJson()
        config.load(conf)
        logger.info("Validating config...")
        validate(config)
        logger.info("Configuration Ok")
        MODE = {
            -1: "development",
            0: "testing",
            1: "production",
        }[int(os.environ.get("BLOGIT_MODE", -1))]
        conf.MODE = os.environ["FLASK_ENV"] = os.environ["NODE_ENV"] = MODE
        return config


def load_from_dotconfig(file=".config") -> ConfigTemplate:
    """
    This loads the configuration from a `.config` file located in the project root.
    It is basically an alias for `load_from_json`

    :param file: ( str ) The name of the file
    """
    return load_from_json(file)


def load_from_dict(config: dict) -> ConfigTemplate:
    """
    This loads the configuration from a dictionary.
    :param config: (dict) The dictionary to load the configuration from.
    """
    conf = ConfigFromJson()
    conf.load(config)
    logger.info("Validating config...")
    validate(conf)
    logger.info("Configuration Ok")
    MODE = {
        -1: "development",
        0: "testing",
        1: "production",
    }[int(os.environ.get("BLOGIT_MODE", -1))]
    conf.MODE = os.environ["FLASK_ENV"] = os.environ["NODE_ENV"] = MODE
    return conf


def load_from_json_string(config: str) -> ConfigTemplate:
    """
    This loads the configuration from a json string.
    :param config: (dict) The json string to load the configuration from.
    """
    config = json.loads(config)
    conf = ConfigFromJson()
    conf.load(config)
    logger.info("Validating config...")
    validate(conf)
    logger.info("Configuration Ok")
    MODE = {
        -1: "development",
        0: "testing",
        1: "production",
    }[int(os.environ.get("BLOGIT_MODE", -1))]
    conf.MODE = os.environ["FLASK_ENV"] = os.environ["NODE_ENV"] = MODE
    return conf


def main(
    config_file: Optional[Union[str, None]] = None
) -> Union[ConfigTemplate, NoReturn]:
    """
    If the parameter config_file was specified, then this function will
    attempt to parse the configuration in that file, otherwise it
    searches for a config file in the project's root directory and then
    attempts to parse it.
    """
    global logger
    logger = logging.getLogger("configLoader")

    # If the config file was specified through the cli
    if config_file:
        with open(config_file) as f:
            try:

                # First we assume it to be a JSON file
                return load_from_dict(json.loads(f.read()))
            except json.decoder.JSONDecodeError:

                # Maybe its a python file then
                return load_from_pyfile(config_file)

    elif os.path.exists(os.path.join(PROJECT_ROOT, "config.py")):
        return load_from_pyfile()

    elif os.path.exists(os.path.join(PROJECT_ROOT, "config.json")):
        return load_from_json()

    elif os.path.exists(os.path.join(PROJECT_ROOT, ".config")):
        return load_from_dotconfig()

    # No config file was found, raise error
    else:
        raise FileNotFoundError(
            "No configuration file was found. "
            + "Please make sure that you have created one of the following files in project root: "
            + "'config.py', 'config.json', '.config'. "
            + "Or specify a file using the '--config-file' cli option"
        )


if __name__ == "__main__":
    from colorama import init

    init()
    print(
        "\x1b[35mhelpers/config_loader.py "
        + "\x1b[31mis a module and is not supposed to be run as a script."
    )
    exit(1)
