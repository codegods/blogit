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
import hashlib
import secrets
from typing import Dict, Tuple
from flask.views import View
from helpers.url_for import url_for
from flask import current_app as app

blueprint = flask.Blueprint(__name__, "api.users")


class UserSignup(View):
    methods = ["POST"]

    def hash(self, pwd: str) -> Tuple[bytes, bytes]:
        salt = secrets.token_hex()
        hash = hashlib.sha512(
            (hashlib.sha512(pwd.encode()).hexdigest() + salt).encode()
        ).hexdigest()
        for _ in range(100000):
            hash = hashlib.sha512(hash.encode()).hexdigest()
        return hash, salt

    def step_1_validator(self, body: dict) -> Dict[str, str]:
        # TODO Implement a check for a valid email address
        requuid = body.get("uuid", uuid.uuid4().hex)
        if "password" not in body or "email" not in body:
            return flask.Response(status=403)
        body["password"], body["salt"] = self.hash(body["password"])
        app.cache.get_store("signup").add(requuid, body)
        return {"uuid": requuid}

    def step_2_validator(self, body: dict) -> Dict[str, str]:
        # TODO Implement a check for a valid username
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return flask.Response({}, status=403)

        reqid = body.pop("uuid")
        user.update(body)
        store.update(reqid, user)
        return flask.Response({}, status=200)

    def step_3_validator(self, body: dict) -> Dict[str, str]:
        # TODO Save the user in the database
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return flask.Response(status=403)

        reqid = user.pop("uuid")
        user.update(body)
        store.update(reqid, user)
        return flask.Response(status=200)

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
