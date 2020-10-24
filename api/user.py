import os
import sys

PROJECT_ROOT = os.path.abspath(
    ".."
    if os.path.abspath(".").split("/")[-1]
    in ["lib", "api", "helpers", "scripts", "tests", "extensions", "docs", "frontend"]
    else "."
)

sys.path.append(PROJECT_ROOT)

del sys, os

import uuid
import json
import flask
from typing import Dict
from flask.views import View
from helpers.url_for import url_for
from flask import current_app as app

blueprint = flask.Blueprint(__name__, "api.users")


class UserSignup(View):
    methods = ["POST"]

    def step_1_validator(self, body: dict) -> Dict[str, str]:
        # TODO Implement a check for a valid email address
        requuid = uuid.uuid4().hex
        app.cache.get_store("signup").add(requuid, body)
        return {"uuid": requuid}

    def dispatch_request(self):
        body = json.loads(flask.request.get_data(as_text=True))

        try:
            return {0: self.step_1_validator}[body["step"]](body)
        except KeyError:
            return "404 - Not found", 404


blueprint.add_url_rule(
    url_for("api.auth.signup.validate"), view_func=UserSignup.as_view("users_signup")
)
