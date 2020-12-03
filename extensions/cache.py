"""
This module implements a in-memory cache system for the application.
"""
import os
import sys

sys.path.append(
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

del os, sys

import time
import logging
import datetime
from threading import Timer
from typing import Any, Union, Dict
from helpers.exception import register


class Store:
    def __init__(self, logger: logging.Logger) -> None:
        """Represents a single cache store"""
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._logger = logger

    def add(self, key: str, value: Any) -> None:
        """Add a certain value to the current store"""
        if key in self._cache:
            self._logger.warn(f"{key} was already present in cache. Overriding.")
        self._cache[key] = {"value": value, "timestamp": datetime.datetime.now()}

    def update(self, key: str, value: Any) -> None:
        """Updates a given value of the current store"""
        if key not in self._cache:
            self._logger.warn(f"{key} not present in cache. Creating new key: {key}")
        self._cache[key] = {"value": value, "timestamp": datetime.datetime.now()}

    def delete(self, key: str) -> Any:
        """
        Deletes a given value in the current store.
        Returns the value it stored
        """
        try:
            return self._cache.pop(key)
        except KeyError:
            self._logger.exception(f"Key {key} not found in cache")
            return None

    def get(self, key: str) -> Any:
        """
        Returns the value stored in the key `key` of the current store
        """
        try:
            return self._cache[key]["value"]
        except KeyError:
            self._logger.exception(f"Key {key} not found in cache")
            raise


class _Cache:
    def __init__(self, app) -> None:
        """Initiates cache service for the app"""
        setattr(app, "cache", self)
        self._logger = logging.getLogger("cache")
        self._stores: Dict[str, Store] = {}
        self._logger.info("Caching extension ready.")
        self._invalidator = CacheInvalidator(self)
        self._invalidator.start()

    def create_store(self, name: str) -> Store:
        """Creates and returns a new cache store of the name `name`"""
        if name in self._stores:
            raise ValueError(f"Store {name} is already existent")

        _store = Store(self._logger)
        self._stores[name] = _store
        return _store

    def get_store(self, name: str) -> Store:
        """
        Returns a cache store that was created earlier by the `create_store` method
        """
        if name not in self._stores:
            raise KeyError(f"Store {name} is non-existent")

        return self._stores[name]

    def delete_store(self, name: str) -> None:
        """Deletes the given store"""
        try:
            del self._stores[name]
        except Exception:
            self._logger.exception("Got this exception when deleting the store")


class CacheInvalidator:
    def __init__(self, cache: _Cache) -> None:
        """
        Invalidates the cache in memory after 10 minutes of inactivity
        """
        self.cache = cache
        self.work = False
        self._th = Timer(900, self.clearer)

    def start(self) -> None:
        """Starts the clearing thread"""
        self.cache._logger.info("Cache invalidator running...")
        self._th.start()
        register(self.kill)

    def kill(self) -> None:
        self.cache._logger.info("Killing cache thread.")
        self._th.cancel()

    def clearer(self):
        """The actual function that clears the cache"""
        ctime = datetime.datetime.now()
        try:
            for store in self.cache._stores.values():
                cache = store._cache
                for k, v in cache.items():
                    diff: datetime.timedelta = ctime - v["timestamp"]
                    # Delete caches older than 10 minutes
                    if diff.seconds > 600:
                        cache.pop(k)
        except RuntimeError:
            # It may happen because of a size change during iteration.
            # Probably because of creation or deletion of a cache obj.
            pass

        # Run every 15 minutes
        self._th = Timer(900, self.clearer)
        self._th.start()


def Cache(config: object, app) -> Union[None, _Cache]:
    """
    Initiates caching in the application according to the configuration
    """
    if config.MODE == "development":
        if config.ENABLE_CACHING_IN_DEVELOPMENT:
            return _Cache(app)
        return None
    elif config.MODE == "production":
        return _Cache(app)
    return None
