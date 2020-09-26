# This file holds configuration settings for our app
# You can also keep dynamic structures.
# Just make sure all configuration is kept in the namespace config
# which is an instance of the Config class.

# Please note that these configuration properties will be overridden
# by actual environment variables

import json


def read_and_parse_json(file_name: str) -> dict:

    with open(file_name) as f:
        return json.loads(f.read())


class Config:
    # Flask server config
    FLASK_HOST = "0.0.0.0"
    FLASK_PORT = "2811"

    # Should we use HTTPS on development server?
    HTTPS = "false"
    # If you set HTTPS to true you MUST specify the following configs
    # Please note that these must be absolute paths
    # SSL_CERT_PATH = "/home/.certs/ssl_cert.crt"
    # SSL_KEY_PATH = "/home/.certs/ssl_key.key"

    # React dev server configuration.
    # Not required in most cases
    REACT_HOST = "0.0.0.0"

    # Do not use sourcemaps
    SHOULD_USE_SOURCEMAP = "false"

    # Development mode
    NODE_ENV = "development"
    MODE = "development"

    # Configuring the MYSQL server
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_AUTH_PLUGIN = "mysql_native_password"

    # We will load this later
    # MYSQL_PASSWORD = "password"


config = Config()
config.MYSQL_PASSWORD = read_and_parse_json("./.env")["MYSQL_PASSWORD"]
