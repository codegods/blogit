import os
import sys

PROJECT_ROOT = os.path.abspath(
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

INDEX_HTML = os.path.join(PROJECT_ROOT, "build", "index.html")

sys.path.append(PROJECT_ROOT)

del sys, os, PROJECT_ROOT
import flask
from helpers.url_for import url_for
from helpers.cookies import login_required
from flask import Blueprint

blueprint = Blueprint(__name__, "static_files")

@blueprint.route("/")
def root():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("views.auth.login"))
def login():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("views.auth.signup"))
def signup():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("views.posts"))
def posts():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("views.tags"))
def tags():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("views.user"))
def user():
    return flask.send_file(INDEX_HTML)

@blueprint.route(url_for("new"))
@login_required()
def new():
    return flask.send_file(INDEX_HTML)
