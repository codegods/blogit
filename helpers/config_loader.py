import importlib.util
import os
import re
from blessings import Terminal


def load(file="config.py", root=None, term=None):

    if not isinstance(term, Terminal):
        term = Terminal()

    PROJECT_ROOT = root or os.path.abspath(
        ".." if os.path.abspath(".").split("/")[-1] == "lib" else "."
    )

    print(f"Loading config from {term.green(os.path.join(PROJECT_ROOT, file))}")

    # Load the config file
    spec = importlib.util.spec_from_file_location("", os.path.join(PROJECT_ROOT, file))
    config = importlib.util.module_from_spec(spec)

    # Execute the script
    spec.loader.exec_module(config)

    # Load the configuration in a dict
    configuration = {}
    for x in dir(config.config):
        if not re.match("__[a-zA-Z0-9_]*__", x):
            print(term.white("Setting value for ") + term.cyan(x))
            configuration.update([(x, config.config.__getattribute__(x))])

    # Set environment variables
    os.environ = {
        **configuration,
        **os.environ,  # Override default config with environment variables
    }

    # Some values that must be there
    os.environ["NODE_ENV"] = os.environ["FLASK_ENV"] = os.environ["MODE"]


if __name__ == "__main__":
    from colorama import init

    init()
    t = Terminal()
    print(
        t.bold(
            t.blue("lib/config_loader.py")
            + t.red("is a module and is not supposed to be run as a script.")
        )
    )
    exit(1)
