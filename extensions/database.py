import atexit
import logging
import mysql.connector


class DataBase:
    def __init__(self, config, app=None) -> None:
        """
        Initiates a database for the application.
        It will connect to a mysql server using the given configuration
        """
        self._logger = logging.getLogger("mysql")
        options = {
            "user": config.USER,
            "password": config.PASSWORD,
        }

        # Attaching optional attributes to arguments
        if hasattr(config, "AUTH_PLUGIN"):
            options["auth_plugin"] = config.AUTH_PLUGIN

        if hasattr(config, "HOST"):
            options["host"] = config.HOST

        self._logger.info("Connecting to mysql server...")

        try:
            self._connection = mysql.connector.connect(**options)
            self._logger.info("Connected.")
        except mysql.connector.errors.Error as err:
            self._logger.exception("Failed to connect to mysql server", exc_info=err)
            raise

        if app:
            self.init_app(app)

    def init_app(self, app) -> None:
        """
        Initiates the app, attaches a `sql` attribute to the app and
        registers a cleanup function to be called when the app is exiting.
        """
        setattr(app, "sql", self)

        # Make sure connection is committed and closed before exiting
        atexit.register(self.tearDown)

    def cursor(self, *args) -> mysql.connector.connection.MySQLCursor:
        """Returns a MySQLCursor on the current connection."""
        return self._connection.cursor(*args)

    def commit(self) -> None:
        """Commits the current connection"""
        self._connection.commit()

    def tearDown(self) -> None:
        """Commits and closes the current connection"""
        self._connection.commit()
        self._connection.close()
        self._logger.warn("MySQL connection closed.")
