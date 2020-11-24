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
import datetime
from typing import Dict
from flask.views import View
from helpers.url_for import url_for
from flask import current_app as app
from helpers.cookies import login_required, with_cookie

blueprint = flask.Blueprint(__name__, "api.users")


class UserSignup(View):
    methods = ["POST"]

    def step_1_validator(self, body: dict) -> Dict[str, str]:
        requuid = body.get("uuid", uuid.uuid4().hex)
        if "password" not in body or "email" not in body:
            return flask.Response("Bad Request", status=400)

        if app.sql.users.get(email=body["email"]):
            return {
                "success": False,
                "error": "This email is already being used by someone else.",
            }
        body["password"] = bcrypt.hashpw(
            body["password"].encode(), bcrypt.gensalt()
        ).decode()
        body.pop("step")
        app.cache.get_store("signup").add(requuid, body)
        return {"uuid": requuid, "success": True}

    def step_2_validator(self, body: dict) -> Dict[str, str]:
        if "username" not in body or "fname" not in body:
            return flask.Response(status=403)

        if app.sql.users.get(username=body["username"]):
            return {
                "success": False,
                "error": "This username is already taken. Please try something else.",
            }
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return {"success": False}, 403

        reqid = body.pop("uuid")
        body.pop("step")
        user.update(body)
        store.update(reqid, user)
        return {"success": True}

    def step_3_validator(self, body: dict) -> Dict[str, str]:
        user, store = None, None
        try:
            store = app.cache.get_store("signup")
            user: dict = store.get(body["uuid"])
        except KeyError:
            return {"success": False}, 403

        reqid = body.pop("uuid")
        body.pop("step")
        user.update(body)
        app.sql.users.create(**user)
        store.delete(reqid)
        return with_cookie(
            "l_id",
            {"email": user["email"], "ip": flask.request.remote_addr},
            {"success": True},
            # Cookie remains valid for 30 days "only"
            expires=datetime.datetime.now() + datetime.timedelta(days=30),
        )

    def dispatch_request(self):
        body = json.loads(flask.request.get_data(as_text=True))

        try:
            return {
                0: self.step_1_validator,
                1: self.step_2_validator,
                2: self.step_3_validator,
            }[body["step"]](body)
        except KeyError:
            return "404 - Not found", 404


class UserSignin(View):
    methods = ["POST"]

    def dispatch_request(self) -> flask.Response:
        body = flask.request.get_data()
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            return "400 - Bad Request", 400
        if "username" not in body or "password" not in body:
            return "400 - Bad Request", 400
        user = app.sql.users.get(email=body["username"])
        if not user:
            return {
                "message": "This email is not registered with us.",
                "error_with": "username",
            }, 403
        if bcrypt.checkpw(body["password"].encode(), user.password.encode()):
            return with_cookie(
                "l_id",
                # Ok, the request sends the email as the 'username' field
                # and I am in no mood to change it now
                {"email": body["username"], "ip": flask.request.remote_addr},
                {"success": True},
                # Cookie remains valid for 30 days "only"
                expires=datetime.datetime.now() + datetime.timedelta(days=30),
            )
        return {"message": "Invalid password", "error_with": "password"}, 403


@blueprint.route(url_for("api.user_info"))
@login_required(user_needed=True)
def user_info():
    return {
        "name": flask.g.user.firstname + " " + (flask.g.user.lastname or ""),
        "avatarUrl": flask.g.user.avatarurl,
        "username": flask.g.user.username,
    }


blueprint.add_url_rule(
    url_for("api.auth.signup.validate"), view_func=UserSignup.as_view("users_signup")
)
blueprint.add_url_rule(
    url_for("api.auth.login"), view_func=UserSignin.as_view("users_signin")
)
