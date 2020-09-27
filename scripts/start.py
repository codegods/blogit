import importlib.util
import os
import re

path = os.path.abspath("./config.py")

if os.path.abspath(".").split("/")[-1] == "utils":
    path = os.path.abspath("../config.py")

spec = importlib.util.spec_from_file_location("", path)
config = importlib.util.module_from_spec(spec)
spec.loader.exec_module(config)
print(" ".join(["" if re.match("__[a-zA-Z0-9_]+__", x) else x for x in dir(config.config)]))
