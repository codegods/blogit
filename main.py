import flask
import os
from extensions import screen
from api import some_view


def load_from_env(key, default=None):
    try:
        return os.environ[key]
    except KeyError:
        return default


def create_app():
    app = flask.Flask(__name__)
    app.register_blueprint(some_view.app)

    screen.Screen(app)

    try:
        app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]
    except KeyError:
        text = (
            "{}: Secret key not specified in config file. Using default security key.".format(
                app.console.t.bold("WARNING") + app.console.t.yellow
            )
            + " This is very dangerous in production mode"
        )
        print(f"\n{app.console.t.yellow + text + app.console.t.normal}\n")

    @app.route("/")
    def index():
        return "It works"

    return app


def run_development_server():
    app = create_app()
    app.config["DEBUG"] = True
    app.run(
        load_from_env("FLASK_HOST", ""),
        int(load_from_env("FLASK_PORT", "2811")),
        load_dotenv=False,
        use_reloader=False,
    )


def run_production_server():
    from gevent.pywsgi import WSGIServer

    app = create_app()
    server = WSGIServer(
        (load_from_env("FLASK_HOST", ""), int(load_from_env("FLASK_PORT", "2811"))), app
    )
    server.serve_forever()


if __name__ == "__main__":

    # If the functions were called as modules, then screen is already initialised
    # but if the code reaches here, it means that it is not initialised.

    from colorama import init

    init()

    if load_from_env("FLASK_ENV") == "production":
        run_production_server()
    else:
        run_development_server()
