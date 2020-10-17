"""
This creates the database structure required for the projoect to work.
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions", "docs", "frontend"]
    else "."
)

sys.path.append(PROJECT_ROOT)

del os

import logging
import mysql.connector
from typing import Union
from colorama import init
from helpers import formatter, config_loader

global logger

logger: Union[logging.Logger, None] = None


class Execute:
    def __init__(self, connection: mysql.connector.connection.MySQLConnection) -> None:
        self._connection = connection

        # The main database
        self._db = "blogit"

        # Tables we will need
        self._structures = {
            "users": [
                "Id char(32) NOT NULL",
                "FirstName varchar(20) NOT NULL",
                "LastName varchar(20)",
                "Username varchar(20) NOT NULL",
                "Password varchar(500) NOT NULL",
                "Email varchar(200) NOT NULL",
                "PRIMARY KEY(Id)",
                "UNIQUE (Username)",
                "UNIQUE (Email)",
            ],
            "posts": [
                "Id char(32) NOT NULL",
                "Author char(32) NOT NULL",
                "Likes_Count int DEFAULT 0",
                "Comments int DEFAULT 0",
                "Content text(1048576)",  # 1024 * 1024 characters = 1 MB
                "PRIMARY KEY (Id)",
                "FOREIGN KEY (Author) REFERENCES users(Id)",
            ],
            "comments": [
                "Id char(64) NOT NULL",
                "Author char(32) NOT NULL",
                "Post char(32) NOT NULL",
                "Content varchar(1024) NOT NULL",
                "PRIMARY KEY (Id)",
                "FOREIGN KEY (Author) REFERENCES users(Id)",
                "FOREIGN KEY (Post) REFERENCES posts(Id)",
            ],
        }

    def start(self) -> None:
        if not self.check_if_db_exists(self._db):
            logger.info("Creating database \x1b[97m{}\x1b[m".format(self._db))
            cursor = self._connection.cursor()
            cursor.execute(
                "create database {};".format(
                    self._connection.converter.escape(self._db)
                )
            )
            self._connection.commit()

        self._connection.cursor().execute(
            "use {}".format(self._connection.converter.escape(self._db))
        )

        for table in self._structures:
            if not self.check_if_table_exists(table):
                logger.info("Creating table \x1b[97m{}\x1b[m".format(table))
                self.create_table(table)

        self.cleanUp()

    def create_table(self, table: str) -> None:
        command = (
            "create table " + table + " (" + ", ".join(self._structures[table]) + ")"
        )
        cursor = self._connection.cursor()
        cursor.execute(command)
        self._connection.commit()

    def check_if_db_exists(self, db: str) -> bool:
        logger.info("Checking for existence of database \x1b[97m{}\x1b[m".format(db))
        cursor = self._connection.cursor(dictionary=True)
        cursor.execute("show databases;")
        result = cursor.fetchall()
        for dbs in result:
            if db == dbs["Database"].decode("utf-8"):
                return True
        return False

    def check_if_table_exists(self, table: str) -> bool:
        logger.info("Checking for existence of table \x1b[97m{}\x1b[m".format(table))
        cursor = self._connection.cursor(dictionary=True)
        cursor.execute("show tables;")
        result = cursor.fetchall()
        for tables in result:
            if table == tables["Tables_in_blogit"].decode("utf-8"):
                return True
        return False

    def cleanUp(self):
        logger.info("Cleaning up...")
        self._connection.commit()
        self._connection.close()
        logger.info("Done.")


def main():
    global logger
    logger = logging.getLogger("mysqlInitiator")

    cfg_file = None
    if "--config-file" in sys.argv:
        cfg_file = sys.argv[sys.argv.index("--config-file") + 1]
    mysql_config = config_loader.main(cfg_file).mysql

    con_options = {
        "user": mysql_config.USER,
        "password": mysql_config.PASSWORD,
    }

    if hasattr(mysql_config, "AUTH_PLUGIN"):
        con_options["auth_plugin"] = mysql_config.AUTH_PLUGIN

    if hasattr(mysql_config, "HOST"):
        con_options["host"] = mysql_config.HOST

    connection: Union[mysql.connector.connection.MySQLConnection, None] = None
    try:
        connection = mysql.connector.connect(**con_options)
    except mysql.connector.errors.Error as e:
        logger.error("Failed to connect to mysql server. Got this exception:")
        logger.exception(e.msg)

    execution: Union[Execute, None] = None
    try:
        # Make the tables
        execution = Execute(connection)
        execution.start()
    except mysql.connector.errors.Error as e:
        logger.error("There was an error while creating tables:")
        logger.exception(e.msg)
        execution.cleanUp()


if __name__ == "__main__":

    init()

    if "--log-file" in sys.argv:
        formatter.init(PROJECT_ROOT, sys.argv[sys.argv.index("--log-file") + 1])
    else:
        formatter.init(PROJECT_ROOT)

    main()
