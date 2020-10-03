import colorama
from blessings import Terminal
import flask
import datetime

colorama.init()


class Screen:
    def __init__(self, app: flask.app = None):
        self.t = Terminal()

        ctime: str = datetime.datetime.now().isoformat()
        ctime = ctime[1: ctime.find(".")]

        self.file = open(f"logs/{ctime}.log", "x")
        self.fname = f"logs/{ctime}.log"

        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app: flask.app) -> None:
        """
        Initiates logging in the app
        :param app: A flask app object.
        """
        self.app = app
        setattr(app, "console", self)

    def log(self, *msg, sep=" ", end="\n"):
        msg = sep.join(msg) + end
        with open(self.fname, "r+") as f:
            f.write(f.read() + f" [{datetime.datetime.now()}] [ INFO ] {msg}")
        print(f" [{datetime.datetime.now()}] [ {self.t.cyan('INFO')} ] {msg}", end="")

    def warn(self, *msg, sep=" ", end="\n"):
        msg = sep.join(msg) + end
        with open(self.fname, "r+") as f:
            f.write(f.read() + f" [{datetime.datetime.now()}] [ WARNING ] {msg}")
        print(
            f" [{datetime.datetime.now()}] [ {self.t.yellow('WARNING')} ] {msg}",
            end="",
        )

    def error(self, *msg, sep=" ", end="\n"):
        msg = sep.join(msg) + end
        with open(self.fname, "r+") as f:
            f.write(f.read() + f" [{datetime.datetime.now()}] [ ERROR ] {msg}")
        print(
            f" [{datetime.datetime.now()}] [ {self.t.red_bold('ERROR')} ] {msg}",
            end=""
        )
