"""
This file holds configuration settings for our app.
The `load` method of the class `Config` is called at app
startup along with the parameters as specified in the definition.

For help on configuring the app, please refer to
docs/CONFIGURING.md

Please note that some configuration properties can be overridden
by actual environment variables
"""


import json
import os
import socket


class MySQL:
    def __init__(self, secrets: dict) -> None:
        """
        This class defines the configuration for connecting to
        the MySQL server. It must specify the host, user, root
        and optionally an auth plugin.

        :param dict secrets: A dictionary containing the secrets
        """
        self.PASSWORD = secrets.get("MYSQL_PASSWORD", None)
        self.HOST = "localhost"
        self.USER = "root"
        self.AUTH_PLUGIN = "mysql_native_password"


class React:
    """
    This class holds the configuration for react
    ( during build as well as dev mode ). The options here
    are passed as environment variables to the webpack
    dev server as well as react build process.

    Please note that all values must be strings.
    """

    def __init__(self) -> None:
        # Should we use HTTPS on development server?
        self.HTTPS = "false"
        # If you set HTTPS to true you MUST specify the following configs
        # Please note that these must be absolute paths
        # self.SSL_CERT_PATH = "/home/.certs/ssl_cert.crt"
        # self.SSL_KEY_PATH = "/home/.certs/ssl_key.key"

        self.HOST = "0.0.0.0"
        self.PORT = "3000"

        # Do not use sourcemaps
        # As they drastically increase the build time.
        self.SHOULD_USE_SOURCEMAP = "false"


class Flask:
    def __init__(self, key: str = "", mode: int = 0):
        """
        Holds the configuration for the flask server.
        The config property must be a dictionary which
        is passed used to update flask.app's default config

        :param str secret: The secret key to be used to sign session cookies
        :param int mode: The current mode.
        -1 = development, 0 = testing, 1 = production
        """
        self.mode = mode
        self.key = key

        self.HOST = "0.0.0.0"
        self.PORT = 2811

    @property
    def config(self):
        conf = {"SECRET_KEY": self.key}

        if self.mode == -1:
            conf.update({"DEBUG": True})

        return conf


class Config(object):
    def __init__(self) -> None:
        # Whether to start webpack dev server along with the flask server
        self.RUN_REACT_IN_DEVELOPMENT = True
        self.RUN_FLASK_IN_DEVELOPMENT = True
        self.MODE = "development"

    def load(self, project_directory: str, mode: int) -> None:
        """
        This function is called when the start/build/test script
        is loading the configuration.

        :param str project_directory: The absolute path to the project's root directory.

        :param int mode: The mode in which the app is being run.
        -1 = development, 0 = testing and 1 = production

        :returns: None
        """
        secrets: str

        def get_free_port() -> int:
            s = socket.socket()
            s.bind(("", 0))
            p = s.getsockname()[1]
            s.close()
            return p

        with open(os.path.join(project_directory, "secrets.json")) as f:
            secrets = json.load(f)

        self.flask = Flask(secrets.get("FLASK_SECRET_KEY"), mode)
        self.mysql = MySQL(secrets)
        self.react = React()

        self.flask.PORT = get_free_port()
        self.react.PORT = str(get_free_port())
