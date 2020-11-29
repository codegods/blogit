#!../venv/bin/python
import os

os.chdir(
    os.path.abspath(
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
)

import re
import time
from typing import List
import blessings


term = blessings.Terminal()


class SLOC:

    _ignore = [
        # Folders
        "node_modules",
        "logs",
        "build",
        "tmp",
        "__pycache__",
        "venv",
        # Files ending .json, .log, .txt or .md
        "\.json$",
        "\.md$",
        "\.txt$",
        "\.log$",
        # Files starting with .
        "^\.",
        # More files
        "LICENSE",
        "chromedriver",
        "yarn.lock",
    ]

    languages = {}
    total = 0
    files = 0

    def start(self):
        print("Starting sloc calculation...  ")
        self.list_dir(".")
        print(term.move_up + term.move_right * 30 + term.green("done"))

    def list_dir(self, path: str) -> None:
        for i in os.listdir(path):
            ignore = False
            for j in self._ignore:
                if re.search(j, i):
                    ignore = True
            if ignore:
                continue

            f = os.path.join(path, i)
            if os.path.isdir(f):
                self.list_dir(f)
            else:
                language = i.split(".")[-1]
                self.files += 1
                if language not in self.languages:
                    self.languages[language] = 0
                try:

                    file = open(f)
                    lines = len(file.readlines())
                    file.close()
                    self.languages[language] += lines
                    self.total += lines
                    print(f"Found \x1b[97m{lines}\x1b[m lines in \x1b[97m{f}\x1b[m")
                    time.sleep(0.1)
                    print(term.move_up + term.clear_eol, end="")
                except UnicodeDecodeError:
                    pass

    def paint(self):
        print("Language wise sloc distribution: \n")
        print(" _______________ ___________ ")
        print("|               |           |")
        print("|   Language    |   Lines   |")
        print("|_______________|___________|")
        print("|               |           |")
        keys = list(self.languages.keys()).copy()
        for key in keys:
            if self.languages[key] == 0:
                self.languages.pop(key)
                continue
            print(
                "|  \x1b[32m",
                "{:<11}".format(key),
                "\x1b[m|\x1b[92m  ",
                "{:<7}".format(self.languages[key]),
                "\x1b[m|",
            )
        print("|_______________|___________|")
        print(
            "\nTotal:\x1b[96m",
            self.total,
            "\x1b[m lines in\x1b[96m",
            self.files,
            "\x1b[mfiles",
        )


class CompletionStatus:
    file = "./TASKLIST.md"
    tasks: List[str] = []
    completed = 0
    pending = 0
    in_progress = 0

    def __init__(self) -> None:
        with open(self.file) as f:
            for line in f.readlines():
                if not (line.startswith("#") or line == "\n"):
                    self.tasks.append(line[2:-1])

    def start(self):
        print("Starting task evaluation...  ")
        self.calc()
        print(term.move_up + term.move_right * 30 + term.green("done"))

    def calc(self):
        for task in self.tasks:
            print(f"Evaluating task: {term.white(task)}")
            if task[-1] == "✓":
                self.completed += 1
            elif task[-1] == "•":
                self.in_progress += 1
            elif task[-1] == "⨯":
                self.pending += 0 if task.startswith("[L]") else 1
            time.sleep(0.1)
            print(term.move_up + term.clear_eol, end="")

    def paint(self):
        total = self.completed + self.pending + self.in_progress
        print(
            "Total",
            term.white(str(total)),
            "tasks planned.",
        )
        print(
            term.green(str(self.completed)),
            "completed,",
            term.cyan(str(self.in_progress)),
            "in progress and",
            term.red(str(self.pending)),
            "pending",
        )
        completed = self.completed / total
        working = self.in_progress / total
        print(
            "[",
            term.white("\u2588" * round(completed * 50)),
            "\u2588" * round(working * 50),
            " " * (50 - round(completed * 50) - round(working * 50)),
            "]",
            sep="",
            end=" ",
        )
        print(str(completed * 100)[:5] + "% completed")


if __name__ == "__main__":
    stat = CompletionStatus()
    sloc = SLOC()
    sloc.start()
    stat.start()
    sloc.paint()
    stat.paint()
