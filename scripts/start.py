import importlib.util
import os
import subprocess
import platform
import sys
from prompt_toolkit import HTML, print_formatted_text

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
        print_formatted_text(
            HTML(
                f"Using terminal <ansiyellow> { default_terminal }</ansiyellow>\n"
                + "Attempting to open terminal...\n"
            )
        )
    else:
        print_formatted_text(
            HTML(
                '<ansired>Failed to detect your terminal, please open a new terminal (or a new tab) and run "'
                + f"<b>cd frontend && { pkg_manager } start</b> in it </ansired>"
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

    print_formatted_text(
        HTML(f"Using <ansigreen>{pkg_manager}</ansigreen> package manager...")
    )
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
        print_formatted_text(
            HTML(
                "<b><ansiyellow>WARNING: Unable to start react dev server. Please start it manually.</ansiyellow></b>"
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
