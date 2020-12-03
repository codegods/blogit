"""
An exception handler that logs all unhandled excepptions and runs
specific code when the interpreter is exiting, either due to `sys.exit`
or due to unhandled fatal exception.
"""
# TODO Write docs for this one

import sys
import atexit
import secrets
import logging
from types import TracebackType
from typing import Any, Callable, Dict, Tuple, Type

this = sys.modules[__name__]


def init():
    # Checks if the `_exit_registry` has already been declared or not.
    # This is to prevent data-loss due to double-initialization.
    if not hasattr(this, "_exit_registry"):
        this._exit_registry = {}

    if not hasattr(this, "_builtin_excepthook"):
        this._builtin_excepthook = sys.excepthook
        sys.excepthook = excepthook

    atexit.register(_call_all_funcs)


def register(func: Callable, *args, **kwargs) -> None:
    """
    Registers a function to be called on exit. Any additional
    parameters are passed to the function as is.
    """
    hash = secrets.token_hex(4)
    this._exit_registry[hash] = (func, (args, kwargs))
    return hash


def runs_on_exit(func: Callable):
    """
    A decorator for running the decorated function on exit.
    Arguments not supported. The registered function can't
    be unregistered.
    """
    register(func)
    return func


def unregister(hash: str) -> None:
    """
    Unregister a function of given hash from the exit registry.
    """
    try:
        this._exit_registry.pop(hash)
    except KeyError:
        logging.warn(f"Function {hash} was never registered.")


def rollback() -> None:
    """
    Unregisters all functions from the exit registry and
    revert to the original excepthook.
    """
    this._exit_registry = {}
    sys.excepthook = this._builtin_excepthook
    delattr(this, "_exit_registry")
    delattr(this, "_builtin_excepthook")


def excepthook(
    base_exc: Type[BaseException], exc: BaseException, tb: TracebackType
) -> None:
    """
    A custom exception hook for logging all uncaught exceptions.
    """
    print("from hook")
    try:
        _call_all_funcs()
    except Exception:
        logging.exception("Got exception while running one of the on_exit functions")
    if isinstance(exc, KeyboardInterrupt):
        return this._builtin_excepthook(base_exc, exc, tb)
    logging.exception("Uncaught exception raised: ", exc_info=(base_exc, exc, tb))


def _call_all_funcs() -> None:
    if not hasattr(this, "_exit_registry"):
        logging.warn("Atexit was not initialised")
    reg: Dict[
        str, Tuple[Callable, Tuple[Tuple[Any], Dict[str, Any]]]
    ] = this._exit_registry
    for func in reg.values():
        func[0](*func[1][0], **func[1][1])
