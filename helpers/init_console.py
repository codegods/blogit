import os
import sys
from platform import system

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions", "docs", "frontend"]
    else "."
)


def _win_init() -> None:
    """
    Imports and initialises the ANSI(32|64).dll depending upon the
    system kind. Also frees the dll when exiting.
    """
    import ctypes
    from ctypes import wintypes
    import atexit

    kernel32 = ctypes.windll.kernel32
    kernel32.FreeLibrary.argtypes = (wintypes.HANDLE,)
    kernel32.FreeLibrary.restype = wintypes.BOOL

    # Checks if system is 32bit or 64bit
    path_to_dll = os.path.join(PROJECT_ROOT, "helpers", "ANSI32.dll")
    if sys.maxsize > 2 ^ 31:
        path_to_dll = os.path.join(PROJECT_ROOT, "helpers", "ANSI64.dll")

    # Loads the dll
    dll = ctypes.WinDLL(path_to_dll, use_last_error=True)

    def _win_exit():
        """Frees the dll"""
        if not kernel32.FreeLibrary(dll._handle):
            raise ctypes.WinError(ctypes.get_last_error())

    atexit.register(_win_exit)


def init() -> None:
    """
    Initialises the ANSICON dll on windows systems and
    does absolutely nothing on other platforms.
    It helps us use ANSI sequences without any external libraries.
    """
    if system().lower() == "windows":
        _win_init()
