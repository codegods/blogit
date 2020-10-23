"""
This module implements a in-memory cache system for the application.
"""
import logging
from typing import Any, Union


class Store:
    def __init__(self, logger: logging.Logger) -> None:
        """Represents a single cache store"""
        self._cache = {}
        self._logger = logger

    def add(self, key: str, value: Any) -> None:
        """Add a certain value to the current store"""
        if key in self._cache:
            self._logger.warning(f"{key} was already present in cache. Overriding.")
        self._cache[key] = value

    def update(self, key: str, value: Any) -> None:
        """Updates a given value of the current store"""
        if key not in self._cache:
            self._logger.warning(f"{key} not present in cache. Creating new key: {key}")
        self._cache[key] = value

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
            return self._cache[key]
        except KeyError:
            self._logger.exception(f"Key {key} not found in cache")
            return None


class _Cache:
    def __init__(self, app) -> None:
        """Initiates cache service for the app"""
        setattr(app, "cache", self)
        self._logger = logging.getLogger("cache")
        self._stores = {}
        self._logger.info("Caching extension ready.")

    def create_store(self, name: str) -> Store:
        """Creates and returns a new cache store of the name `name`"""
        if name in self._stores:
            raise ValueError(f"Store {name} is already existent")

        _store = Store()
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
