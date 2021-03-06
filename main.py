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
from api import user, uploader, render, posts, static_files, storage
from helpers import formatter
from extensions import database, cache
from typing import NoReturn, Union

logger: Union[logging.Logger, None] = None


def create_app(config: object, mysql_config: object) -> flask.app:
    app = flask.Flask(
        __name__,
    )

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
    app.register_blueprint(storage.blueprint)
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
    except SystemExit:
        app.cache._invalidator.kill()
        raise


def run_production_server(config: object, mysql: object) -> NoReturn:
    app = create_app(config, mysql)
    if sys.platform == "win32":
        from gevent.pywsgi import WSGIServer

        server = WSGIServer((config.HOST, int(config.PORT)), app)
        try:
            logger.info(
                "Starting server on {}://{}:{}".format("http", config.HOST, config.PORT)
            )
            server.serve_forever()
        except KeyboardInterrupt:
            logger.info("Server shutting down...")
    else:
        from meinheld import server

        logger.warning(
            "This is not the recommended way to go with on non-windows systems. "
            "Please use gunicorn instead"
        )

        server.listen(
            (config.HOST, int(config.PORT)),
        )
        try:
            logger.info(
                "Starting server on {}://{}:{}".format("http", config.HOST, config.PORT)
            )
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

    if "--flask-config" not in sys.argv or "--mysql-config" not in sys.argv:
        logger.error("Flask and mysql config are not specified in commandline.")

    logger = logging.getLogger("server")

    flask_config = deserialize(sys.argv[sys.argv.index("--flask-config") + 1])
    mysql_config = deserialize(sys.argv[sys.argv.index("--mysql-config") + 1])

    if flask_config.MODE == "development":
        run_development_server(flask_config, mysql_config)
    else:
        run_production_server(flask_config, mysql_config)


if __name__ == "__main__":

    # If the functions were called as modules, then screen is already initialised
    # but if the code reaches here, it means that it is not initialised.
    from helpers import init_console, exception

    exception.init()
    init_console.init()

    main()

# Code shouldn't reach here if it is being run as a script
logger: logging.Logger = logging.getLogger("server")
