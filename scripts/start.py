import importlib.util
import os
import subprocess
import platform
import sys
from colorama import init
from blessings import Terminal

init()
term = Terminal()


PROJECT_ROOT = os.path.abspath(
    ".." if os.path.abspath(".").split("/")[-1] == "utils" else "."
)


def open_react_in_linux(pkg_manager: str) -> None:

    print("Attempting to find default terminal...")
    # Attempt to find the default terminal
    default_terminal = (
        subprocess.Popen(
            [
                "/bin/bash",
                os.path.join(PROJECT_ROOT, "lib", "find_default_terminal.sh"),
                f"{pkg_manager} start",
            ],
            stdout=subprocess.PIPE,
            cwd=os.path.join(PROJECT_ROOT, "frontend"),
            env=os.environ,
        )
        .communicate()[0]
        .decode("utf-8")
        .replace("\n", "")
    )

    if default_terminal:
        print(
            f"Using terminal {term.yellow(default_terminal) }\n"
            + "Attempting to open terminal...\n"
        )
    else:
        print(
            term.red(
                'Failed to detect your terminal, please open a new terminal (or a new tab) and run "'
                + f"{ term.bold('cd frontend && ' + pkg_manager + ' start') } in it"
            )
        )


# Get the config loader
spec = importlib.util.spec_from_file_location(
    "", os.path.join(PROJECT_ROOT, "helpers/config_loader.py")
)
loader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(loader)

# Allow setting config file from cli
if "--config-file" in sys.argv:
    loader.load(sys.argv[sys.argv.index("--config-file") + 1])
else:
    loader.load("config.py")

if os.environ["FLASK_ENV"] == "development" and os.environ["RUN_REACT_ON_DEVELOPMENT"]:
    pkg_manager = "npm"
    if os.path.isfile(os.path.join(PROJECT_ROOT, "frontend", "yarn.lock")):
        pkg_manager = "yarn"

    print(f"Using {term.green(pkg_manager)} package manager...")
    if "linux" == platform.system().lower():
        open_react_in_linux(pkg_manager)

    elif "windows" == platform.system.lower():
        print("Attempting to start react dev server...")
        subprocess.Popen(
            ["start", f"{pkg_manager}", "start"],
            cwd=os.path.join(PROJECT_ROOT, "frontend"),
            env=os.environ,
        )
    else:
        print(
            term.yellow_bold(
                "WARNING: Unable to start react dev server. Please start it manually."
            )
        )

if os.environ["FLASK_ENV"] == "production":
    spec = importlib.util.spec_from_file_location(
        "", os.path.join(PROJECT_ROOT, "main.py")
    )
    main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(main)
    main.run_production_server()

elif os.environ["RUN_FLASK_ON_DEVELOPMENT"]:
    spec = importlib.util.spec_from_file_location(
        "", os.path.join(PROJECT_ROOT, "main.py")
    )
    main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(main)
    main.run_development_server()
