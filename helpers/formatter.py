import os
import re
import logging
import datetime
from sys import stdout

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
            + datetime.datetime.fromtimestamp(record.created).isoformat()
            + "\x1b[m"
        )
        levelname = (
            {
                "INFO": "\x1b[36m",  # Cyan
                "DEBUG": "\x1b[32m",  # Green
                "WARN": "\x1b[33m",  # Yellow
                "WARNING": "\x1b[33m",  # Yellow
                "ERROR": "\x1b[31m",  # Red
                "CRITICAL": "\x1b[31m\x1b[1m",  # Red + Bold
            }.get(record.levelname, '')
            + record.levelname
            + "\x1b[m"
        )

        #     Dim magenta
        #         |
        name = "\x1b[35m\x1b[2m" + record.name + "\x1b[0m"
        res = f"[{asctime}] [{levelname}] {name}: {record.msg}"
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
        record.msg = re.sub("\\033\[[0-9;m]+", "", record.msg)  # noqa: W605
        res = "[{asctime}] [{levelname}] {name}: {msg}".format(**vars(record))
        return res


def getLogger(name: str = "") -> logging.Logger:
    """
    Returns a logger with all required formatting in place.
    Attaches a stream and a file handler to the logger and
    returns the logger.
    :param name: Name of the logger
    :returns: loggging.Logger
    """
    global filename

    logger = logging.getLogger(name)
    fh = logging.FileHandler(filename)
    fh.setFormatter(FileFormatter("%(message)s"))
    sh = logging.StreamHandler(stdout)
    sh.setFormatter(StreamFormatter("%(message)s"))
    logger.propagate = False
    logger.addHandler(sh)
    logger.addHandler(fh)
    return logger


def init(root: str, logFile: str = None) -> None:
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

    # Log all messages
    logging.basicConfig(level=logging.DEBUG)
    return logFile
