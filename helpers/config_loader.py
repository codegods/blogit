import importlib.util
import os
import re
from prompt_toolkit import HTML, print_formatted_text


def load(file="config.py", root=None):

    PROJECT_ROOT = root or os.path.abspath(
        ".." if os.path.abspath(".").split("/")[-1] == "lib" else "."
    )

    print_formatted_text(
        HTML(
            f"Loading config from <ansigreen>{os.path.join(PROJECT_ROOT, file)}</ansigreen>"
        )
    )

    # Load the config file
    spec = importlib.util.spec_from_file_location("", os.path.join(PROJECT_ROOT, file))
    config = importlib.util.module_from_spec(spec)

    # Execute the script
    spec.loader.exec_module(config)

    # Load the configuration in a dict
    configuration = {}
    for x in dir(config.config):
        if not re.match("__[a-zA-Z0-9_]*__", x):
            print_formatted_text(
                HTML(
                    f"<ansiwhite>Setting value for </ansiwhite><ansicyan>{x}</ansicyan>"
                )
            )
            configuration.update([(x, config.config.__getattribute__(x))])

    # Set environment variables
    os.environ = {
        **configuration,
        **os.environ,  # Override default config with environment variables
    }

    # Some values that must be there
    os.environ["NODE_ENV"] = os.environ["FLASK_ENV"] = os.environ["MODE"]


if __name__ == "__main__":
    print_formatted_text(
        HTML(
            "<b><ansiblue>lib/config_loader.py</ansiblue><ansired> is a module and is not"
            + " supposed to be run as a module.</ansired></b>"
        )
    )
    exit(1)
