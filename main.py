import flask
import os
from prompt_toolkit import print_formatted_text, HTML


def load_from_env(key, default=None):
    try:
        return os.environ[key]
    except KeyError:
        return default


def create_app():
    app = flask.Flask(__name__)
    try:
        app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]
    except KeyError:
        print_formatted_text(
            HTML(
                "<ansiyellow><b>WARNING</b> Secret key not specified in config file. Using default security key."
                + " <b>This is very dangerous in production mode.</b></ansiyellow>"
            )
        )

    @app.route("/")
    def index():
        return "It works"

    return app


def run_development_server():
    app = create_app()
    app.config["DEBUG"] = True
    app.run(
        load_from_env("FLASK_HOST", ""),
        load_from_env("FLASK_PORT", "2811"),
        load_dotenv=False,
    )


def run_production_server():
    from gevent.pywsgi import WSGIServer

    app = create_app()
    server = WSGIServer(
        (load_from_env("FLASK_HOST", ""), load_from_env("FLASK_PORT", "2811")), app
    )
    server.serve_forever()


if __name__ == "__main__":
    if load_from_env("FLASK_ENV") == "production":
        run_production_server()
    else:
        run_development_server()
