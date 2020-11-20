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
import json
import flask
from markdown import markdown as md
from helpers.url_for import url_for
from .render import MentionsExtension
from helpers.cookies import login_required
from flask import Blueprint, current_app as app

blueprint = Blueprint(__name__, "posts")


@blueprint.route(url_for("api.posts.create"), methods=["POST"])
@login_required(user_needed=True)
def create():
    request = flask.request.get_data().decode()
    try:
        request = json.loads(request)
    except json.JSONDecodeError:
        return "Request is badly encoded", 400

    if any([prop not in request for prop in ["title", "content"]]):
        return "Not all request properties were specified", 400

    if len(request["title"]) == "" or len(request["content"]) == "":
        return "Request is empty", 400
    if len(request["title"]) > 100 or len(request["content"]) > 40960:
        return "Request length too long", 413

    try:
        uuid = app.sql.posts.create(
            flask.g.user.username, request["title"], md(request["content"])
        )
        return uuid, 200
    except Exception:
        app.logger.exception()
        return "Server failed to create the post. Please retry again later.", 500
