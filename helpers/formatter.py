import os
import re
import logging
import datetime
import logging.config
from sys import stdout
from traceback import format_exception

global filename
filename: str


class StreamFormatter(logging.Formatter):
    """
    Custom formatter for stream handler. It just adds colors to the output so that
    its is more readable.
    """

    def format(self, record: logging.LogRecord) -> str:
        asctime = (
            "\x1b[2m"
            + datetime.datetime.fromtimestamp(record.created)
            .isoformat()
            .split("T")[1]  # Date is an overkill in streams, so remove it
            + "\x1b[m"
        )
        msg = record.getMessage()
        levelname = (
            {
                "INFO": "\x1b[36m",  # Cyan
                "DEBUG": "\x1b[32m",  # Green
                "WARN": "\x1b[33m",  # Yellow
                "WARNING": "\x1b[33m",  # Yellow
                "ERROR": "\x1b[31m",  # Red
                "CRITICAL": "\x1b[31m\x1b[1m",  # Red + Bold
            }.get(record.levelname, "")
            + record.levelname
            + "\x1b[m"
        )

        #     Dim magenta
        #         |
        name = "\x1b[35m\x1b[2m" + record.name + "\x1b[0m"
        res = f"[{asctime}] [{levelname}] {name}: {msg}"
        if record.levelno >= logging.ERROR and record.exc_info is not None:
            res += "\n\x1b[31m" + "\n".join(format_exception(*record.exc_info)) + "\n\x1b[m"
        return res


class FileFormatter(logging.Formatter):
    """
    Custom formatter for file handler. It strips out control characters
    from the message so that output on screen is coloured but not on
    the expense of weird characters in log files
    """

    def format(self, record: logging.LogRecord) -> str:
        record.asctime = datetime.datetime.fromtimestamp(record.created).isoformat()

        # This will prevent any ANSI code from making their way to
        # the log files
        msg = re.sub("\\033\[[0-9;m]+", "", record.getMessage())  # noqa: W605
        res = f"[{record.asctime}] [{record.levelname}] {record.name}: {msg}"
        if record.levelno >= logging.ERROR and record.exc_info is not None:
            res += "\n" + "\n".join(format_exception(*record.exc_info)) + "\n"
        return res


def init(root: str, logFile: str = None) -> str:
    """
    Initiates logging in any app. Creates a log file in the `logs`
    directory of the project root. Creates that directory if it doesn't
    exist already. The name of the file is in the format
    `YYYY_MM_DDTHHMMSS.log`.

    :param root: The root directory of the project.
    :param logFile: (Optional) The name of the log file to use.
    If not specified then one will be created for you.
    """
    global filename
    # Set up logging
    logFile = (
        logFile
        or datetime.datetime.now()
        .isoformat()
        .split(".")[0]
        .replace(":", "")
        .replace("-", "_")
        + ".log"
    )
    log_dir = os.path.join(root, "logs")
    logFile = os.path.join(log_dir, logFile)

    # Create the logFile if it doesn't exist already
    if not os.path.exists(logFile):
        if not os.path.exists(log_dir):
            os.mkdir(log_dir)
        open(logFile, "x").close()

    filename = logFile

    logging.config.dictConfig(
        {
            "version": 1,
            "level": logging.INFO,
            "formatters": {"sf": {"()": StreamFormatter}, "ff": {"()": FileFormatter}},
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "sf",
                    "stream": stdout,
                },
                "file": {
                    "class": "logging.FileHandler",
                    "formatter": "ff",
                    "filename": logFile,
                },
            },
            "loggers": {
                "": {"handlers": ["file", "console"], "level": logging.DEBUG},
            },
        }
    )
    return logFile
