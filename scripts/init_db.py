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
from helpers.init_console import init
from helpers import formatter, config_loader

global logger

logger: Union[logging.Logger, None] = None


class Execute:
    def __init__(self, connection: mysql.connector.connection.MySQLConnection) -> None:
        """Initiates the database by creating required tables and their structures."""
        self._connection = connection

        # The main database
        self._db = "blogit"

        # Tables we will need
        self._structures = {
            "users": [
                "Id char(64) NOT NULL",
                "Username varchar(20) NOT NULL",
                "FirstName varchar(20) NOT NULL",
                "Email varchar(200) NOT NULL",
                "Password char(60) NOT NULL",
                "LastName varchar(20)",
                "Bio varchar(500)",
                "AvatarUrl varchar(200)",
                "PRIMARY KEY(Id)",
                "UNIQUE (Username)",
                "UNIQUE (Email)",
            ],
            "posts": [
                "Id char(64) NOT NULL",
                "Author char(64) NOT NULL",
                "Likes_Count int DEFAULT 0",
                "Comments int DEFAULT 0",
                "Content text(409600)",  # 409600chars = 1024char/kb * 400 characters = 400kB
                "PRIMARY KEY (Id)",
                "FOREIGN KEY (Author) REFERENCES users(Id)",
            ],
            "comments": [
                "Id char(64) NOT NULL",
                "Author char(64) NOT NULL",
                "Post char(64) NOT NULL",
                "Content varchar(1024) NOT NULL",
                "PRIMARY KEY (Id)",
                "FOREIGN KEY (Author) REFERENCES users(Id)",
                "FOREIGN KEY (Post) REFERENCES posts(Id)",
            ],
            "storage": [
                "Id char(64) NOT NULL",
                "Name varchar(32) NOT NULL",
                "Contents text(5242880) NOT NULL",  # 5242880chars = 1024 chars/kb * 1024kb/mb * 5 = 5MB,
                "PRIMARY KEY (Id)"
            ],
            "followers": [
                "Following char(64) NOT NULL",
                "Follower char(64) NOT NULL",
                "FOREIGN KEY (Following) REFERENCES users(Id)",
                "FOREIGN KEY (Follower) REFERENCES users(Id)",
            ]
        }

    def start(self) -> None:
        """Starts the task"""
        if not self.check_if_db_exists(self._db):
            # Create the DB if it doesn't exist
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

        # Create all required tables
        for table in self._structures:
            if not self.check_if_table_exists(table):
                logger.info("Creating table \x1b[97m{}\x1b[m".format(table))
                self.create_table(table)

        # All tasks done. Cleanup.
        self.cleanUp()

    def create_table(self, table: str) -> None:
        """
        Creates a given table by taking its structure from `self._structures`
        """
        command = (
            "create table " + table + " (" + ", ".join(self._structures[table]) + ")"
        )
        cursor = self._connection.cursor()
        cursor.execute(command)
        self._connection.commit()

    def check_if_db_exists(self, db: str) -> bool:
        """Checks if a database exists or not"""
        logger.info("Checking for existence of database \x1b[97m{}\x1b[m".format(db))
        cursor = self._connection.cursor(dictionary=True)
        cursor.execute("show databases;")
        result = cursor.fetchall()
        for dbs in result:
            if db == dbs["Database"].decode("utf-8"):
                return True
        return False

    def check_if_table_exists(self, table: str) -> bool:
        """Checks if a table exists or not"""
        logger.info("Checking for existence of table \x1b[97m{}\x1b[m".format(table))
        cursor = self._connection.cursor(dictionary=True)
        cursor.execute("show tables;")
        result = cursor.fetchall()
        for tables in result:
            if table == tables["Tables_in_blogit"].decode("utf-8"):
                return True
        return False

    def cleanUp(self):

        # Clean up jobs
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

    # Attaching optional attributes to arguments
    if hasattr(mysql_config, "AUTH_PLUGIN"):
        con_options["auth_plugin"] = mysql_config.AUTH_PLUGIN

    if hasattr(mysql_config, "HOST"):
        con_options["host"] = mysql_config.HOST

    connection: Union[mysql.connector.connection.MySQLConnection, None] = None
    try:
        logger.info("Connecting to mysql server...")
        connection = mysql.connector.connect(**con_options)
        logger.info("Connected.")
    except mysql.connector.errors.Error:
        logger.exception("Error while connecting to mysql: ", exc_info=1)

    execution: Union[Execute, None] = None
    try:
        # Make the tables
        execution = Execute(connection)
        execution.start()
    except mysql.connector.errors.Error as e:
        logger.error("There was an error while creating tables:")
        logger.exception(e.msg)
        # Make sure that everything we did is commited
        # and the connection is closed, even on a failure
        execution.cleanUp()


if __name__ == "__main__":

    init()

    # Initiate the logger
    if "--log-file" in sys.argv:
        formatter.init(PROJECT_ROOT, sys.argv[sys.argv.index("--log-file") + 1])
    else:
        formatter.init(PROJECT_ROOT)

    main()
