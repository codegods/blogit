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
from helpers.md import render
from helpers.url_for import url_for
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
            flask.g.user.username, request["title"], render(request["content"])
        )
        return uuid, 200
    except Exception:
        app.logger.exception()
        return "Server failed to create the post. Please retry again later.", 500


@blueprint.route(url_for("api.posts.get"))
def get():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    post = app.sql.posts.get(uuid=uuid)
    if post is None or post == 0:
        return "Post not found", 404
    _date = post.date_posted
    return {
        "title": post.title,
        "content": post.content,
        "datetime": "{hour}:{mint} {date} {month}, {year}".format(
            hour=_date.hour if _date.hour > 9 else "0" + str(_date.hour),
            mint=_date.minute if _date.minute > 9 else "0" + str(_date.minute),
            date=_date.day if _date.day > 9 else "0" + str(_date.day),
            month={
                1: "Jan",
                2: "Feb",
                3: "Mar",
                4: "Apr",
                5: "May",
                6: "Jun",
                7: "Jul",
                8: "Aug",
                9: "Sep",
                10: "Oct",
                11: "Nov",
                12: "Dec",
            }[_date.month],
            year=_date.year,
        ),
    }


@blueprint.route(url_for("api.posts.stats"))
def stats():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    post = app.sql.posts.get(uuid=uuid)
    if post is None or post == 0:
        return "Post not found", 404
    return post.get_stats()
