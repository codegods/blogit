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

import json
import flask
import base64
import logging
from api import user, uploader, render, posts, static_files
from helpers import formatter
from extensions import database, cache
from typing import NoReturn, Union

logger: Union[logging.Logger, None] = None


def create_app(config: object, mysql_config: object) -> flask.app:
    app = flask.Flask(__name__, static_folder=os.path.join(PROJECT_ROOT, "build", "static"), static_url_path="/static")

    # The database extension
    database.DataBase(mysql_config, app)

    # Enables the cache extension
    cache.Cache(config, app)
    app.cache.create_store("signup")
    app.cache.create_store("uploads")

    # Register blueprints
    app.register_blueprint(user.blueprint)
    app.register_blueprint(uploader.blueprint)
    app.register_blueprint(render.blueprint)
    app.register_blueprint(posts.blueprint)
    app.register_blueprint(static_files.blueprint)
    # Initiate logging
    app.logger = logger

    app.config.update(config.config)
    if "SECRET_KEY" not in config.config:
        app.config["SECRET_KEY"] = "bg6/X`k!`-|iyh,?fbms,z0034VSjH5g"
        logger.warn(
            "Secret key not specified in config file. Using default security key."
            + " This is very dangerous in production mode"
        )

    return app


def run_development_server(config: object, mysql: object) -> NoReturn:
    app = create_app(config, mysql)
    try:
        app.run(
            config.HOST,
            int(config.PORT),
        )
    except KeyboardInterrupt:
        logger.info("Server shutting down...")


def run_production_server(config: object, mysql: object) -> NoReturn:
    app = create_app(config, mysql)
    from meinheld import server

    server.listen(
        (config.HOST, int(config.PORT)),
    )
    try:
        logger.info("Starting server on {}://{}:{}".format("http", config.HOST, config.PORT))
        server.run(app)
    except KeyboardInterrupt:
        logger.info("Server shutting down...")


def deserialize(encoded: str) -> object:
    class EmtpyClass:
        pass

    cls = EmtpyClass()
    decoded = json.loads(base64.b64decode(encoded.encode()).decode("utf-8"))
    for i in decoded:
        setattr(cls, i, decoded[i])
    return cls


def main() -> NoReturn:
    global logger
    if "--log-file" in sys.argv:
        formatter.init(PROJECT_ROOT, sys.argv[sys.argv.index("--log-file") + 1])
    logger = logging.getLogger("server")

    if "--flask-config" not in sys.argv or "--mysql-config" not in sys.argv:
        logger.error("Flask and mysql config are not specified in commandline.")

    flask_config = deserialize(sys.argv[sys.argv.index("--flask-config") + 1])
    mysql_config = deserialize(sys.argv[sys.argv.index("--mysql-config") + 1])

    if flask_config.MODE == "development":
        run_development_server(flask_config, mysql_config)
    else:
        run_production_server(flask_config, mysql_config)


if __name__ == "__main__":

    # If the functions were called as modules, then screen is already initialised
    # but if the code reaches here, it means that it is not initialised.

    from helpers.init_console import init

    init()

    main()
