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

del sys, os

import uuid
import json
import flask
import bcrypt
from typing import Dict
from flask.views import View
from helpers.url_for import url_for
from flask import current_app as app

blueprint = flask.Blueprint(__name__, "api.users")


class UserSignup(View):
    methods = ["POST"]

    def step_1_validator(self, body: dict) -> Dict[str, str]:
        # TODO Implement a check for a valid email address
        requuid = body.get("uuid", uuid.uuid4().hex)
        if "password" not in body or "email" not in body:
            return flask.Response(status=403)
        body["password"] = bcrypt.hashpw(body["password"].encode(), bcrypt.gensalt()).decode()
        app.cache.get_store("signup").add(requuid, body)
        return {"uuid": requuid}

    def step_2_validator(self, body: dict) -> Dict[str, str]:
        # TODO Implement a check for a valid username
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return {"success": False}, 403

        reqid = body.pop("uuid")
        user.update(body)
        store.update(reqid, user)
        return {"success": True}

    def step_3_validator(self, body: dict) -> Dict[str, str]:
        # TODO Save the user in the database
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return flask.Response(status=403)

        reqid = body.pop("uuid")
        user.update(body)
        store.update(reqid, user)
        return {"success": True}

    def dispatch_request(self):
        body = json.loads(flask.request.get_data(as_text=True))

        try:
            print(body["step"])
            return {
                0: self.step_1_validator,
                1: self.step_2_validator,
                2: self.step_3_validator,
            }[body["step"]](body)
        except KeyError:
            return "404 - Not found", 404


blueprint.add_url_rule(
    url_for("api.auth.signup.validate"), view_func=UserSignup.as_view("users_signup")
)
