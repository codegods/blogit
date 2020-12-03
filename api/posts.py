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
from helpers.flatten import flatten
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


@blueprint.route(url_for("api.posts.author"))
def author():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    post = app.sql.posts.get(uuid=uuid)
    if post is None or post == 0:
        return "Post not found", 404
    return post.get_author()


@blueprint.route(url_for("api.posts.liked_by_user"))
@login_required(True)
def has_user_liked():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    csr = app.sql.cursor()
    csr.execute(
        "select post from likes where likee=%s and post=%s", (flask.g.user.id, uuid)
    )
    try:
        if csr.fetchone():
            return "true"
        return "false"
    except Exception:
        return "false"


@blueprint.route(url_for("api.posts.like"))
@login_required(True)
def like():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    post = app.sql.posts.get(uuid=uuid)
    if not post:
        return "Post not found", 404
    del post
    csr = app.sql.cursor()
    csr.execute(
        "select post from likes where likee=%s and post=%s", (flask.g.user.id, uuid)
    )
    if csr.fetchone():
        return "User has already liked this post", 400
    else:
        app.sql.autocommit("insert into likes values (%s, %s)", (flask.g.user.id, uuid))
    return "liked"


@blueprint.route(url_for("api.posts.share"))
def share():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    post = app.sql.posts.get(uuid=uuid)
    if not post:
        return "Post not found", 404
    app.sql.autocommit(
        "update posts set share_count = %s where id=%s", (post.share_count + 1, post.id)
    )
    return "shared"


@blueprint.route(url_for("api.posts.get_comments"))
def get_comments():
    uuid = flask.request.args.get("uuid")
    fro = flask.request.args.get("from")
    if any([p is None for p in [uuid, fro]]):
        return "Bad Request", 400
    if not (fro.isdigit()):
        return "Bad request", 400
    csr = app.sql.cursor()
    csr.execute(
        "select id from comments where post=%s order by date_posted desc limit 10 offset %s",
        (uuid, int(fro)),
    )
    return {"comments": csr.fetchall()}


@blueprint.route(url_for("api.posts.get_comment_by_id"))
def get_comment_by_id():
    uuid = flask.request.args.get("uuid")
    if uuid is None:
        return "Bad Request", 400
    csr = app.sql.cursor(dictionary=True)
    csr.execute(
        "select "
        "users.username as 'username', "
        "users.avatarurl as 'avatar', "
        "comments.content as 'content' "
        "from comments "
        "inner join users "
        "on comments.author = users.id "
        "where comments.id=%s",
        (uuid,),
    )
    res = csr.fetchone()
    if res:
        return res
    return "Comment not found", 404


@blueprint.route(url_for("api.posts.comment"), methods=["POST"])
@login_required(True)
def post_a_comment():
    try:
        body: dict = json.loads(flask.request.get_data())
    except json.JSONDecodeError:
        return "Bad encoding", 400

    if any([prop not in body for prop in ["uuid", "comment"]]):
        return "Req params not specified", 400

    if not app.sql.posts.get(uuid=body.get("uuid")):
        return "Non-existent post", 400

    try:
        uuid = app.sql.comments.create(body["comment"], flask.g.user.id, body["uuid"])
        return uuid
    except Exception:
        app.logger.exception("Error while creating comment: "), 500


@blueprint.route(url_for("api.posts.explore"))
@login_required(True)
def explore():
    csr = app.sql.cursor()
    result = {}
    csr.execute(
        "select "
        "posts.id "
        "from posts "
        "inner join followers "
        "on followers.follower=%s "
        "order by posts.date_posted desc "
        "limit 15",
        (flask.g.user.id,),
    )
    result["followers"] = flatten(csr.fetchall())
    csr.execute(
        "select "
        "posts.id "
        "from posts "
        "left join likes "
        "on likes.post=posts.id "
        "group by posts.id "
        "order by count(likes.likee) desc "
        "limit 15"
    )
    result["liked"] = flatten(csr.fetchall())
    csr.execute("select id from posts order by date_posted desc limit 15")
    result["recents"] = flatten(csr.fetchall())
    return result


@blueprint.route(url_for("api.posts.explore.info"))
@login_required()
def explore_info():
    uuid = flask.request.args.get("uuid")
    if not uuid:
        return "Bad request", 400

    csr = app.sql.cursor(dictionary=True)
    csr.execute(
        "select "
        "count( distinct likes.likee) as 'likes', "
        "count( distinct comments.id) as 'comments', "
        "posts.share_count as 'shares', "
        "posts.title as 'title', "
        "users.username as 'name', "
        "users.avatarurl as 'avatar' "
        "from ("
        "("
        "( posts left join likes on posts.id=likes.post) "
        "left join comments on comments.post=posts.id) "
        "left join users on users.username=posts.author) "
        "where posts.id=%s "
        "group by posts.id",
        (uuid,),
    )
    res = csr.fetchone()
    return {
        "stats": {
            "likes": res["likes"],
            "comments": res["comments"],
            "shares": res["shares"],
        },
        "title": res["title"],
        "author": {"avatar": res["avatar"], "name": res["name"]},
    }


@blueprint.route(url_for("api.posts.get_by_author"))
def get_by_author():
    uname = flask.request.args.get("uname")
    if not uname:
        return "Bad request", 400
    csr = app.sql.cursor()
    csr.execute("select id from posts where author=%s", (uname,))
    return {"posts": flatten(csr.fetchall())}
