import colorama
from blessings import Terminal

colorama.init()


class Screen():
    def __init__(self, app=None):
        self.t = Terminal()
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        setattr(app, "console", self.t)
        print(self.t.bold("Hello"))

