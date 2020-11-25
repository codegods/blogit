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

import re
import flask
from PIL import Image
from io import BytesIO
from helpers.url_for import url_for
from flask import request, Blueprint, current_app as app

blueprint = Blueprint(__name__, "api.storage")


@blueprint.route(url_for("storage"))
def get_from_storage(uuid: str):
    """
    Function to return a given file from storage
    """
    file = app.sql.storage.findByUUID(uuid)
    if not file:
        return "This file was not found on server", 404
    response = flask.send_file(BytesIO(file.get_bytes()), mimetype=file.get_mimetype())

    # As files in storage are static assets, we ask the browser to
    # cache all such files for a year to speed up subsequent requests.
    response.headers.set("Cache-Control", "max-age=31536000")
    return response


@blueprint.route(url_for("api.storage.avatar"))
def avatar():
    username = request.args.get("user")
    if not username:
        return "User not specified", 400
    user = app.sql.users.get(username=username)
    if not user:
        return "User is non-existent", 404
    img = app.sql.storage.get(user.avatarurl)
    del username, user

    if not re.match("image/[\w]+", img.get_mimetype()):
        return "Requested resource is not an image", 400

    size = request.args.get("size") or "256"
    if not size.isdigit():
        return "Bad size specified", 400
    size = int(size)

    pic = Image.open(BytesIO(img.get_bytes()))
    nimg = BytesIO()
    pic.thumbnail((size, size))
    pic.save(nimg, format="png")
    nimg.seek(0)
    res = flask.send_file(nimg, attachment_filename=img.name, mimetype="image/png")
    res.headers.set("Cache-Control", "max-age=31536000")
    return res


@blueprint.route(url_for("api.storage.image"))
def image(uuid: str):
    img = app.sql.storage.get(uuid)
    if not img:
        return "Image not found", 404

    if not re.match("image/[\w]+", img.get_mimetype()):
        return "Requested resource is not an image", 400

    size = request.args.get("size")
    if not size:
        return "Size not specified", 400

    size = re.match("(?P<w>[\d]+)x(?P<h>[\d]+)", size)
    if not size:
        return "Bad size specified", 400
    size = size.groupdict()

    pic = Image.open(BytesIO(img.get_bytes()))
    nimg = BytesIO()
    pic.resize((int(size["w"]), int(size["h"]))).save(nimg, format="png")
    nimg.seek(0)
    res = flask.send_file(nimg, attachment_filename=img.name, mimetype="image/png")
    res.headers.set("Cache-Control", "max-age=31536000")
    return res
