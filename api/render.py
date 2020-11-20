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

blueprint = flask.Blueprint(__name__, "renderer")


@blueprint.route(url_for("api.renderer"), methods=["POST"])
@login_required()
def renderer():
    """API endpoint for rendering markdown requests"""
    try:
        request = json.loads(flask.request.get_data().decode())
    except json.JSONDecodeError:
        return "Bad Request Encoding", 400

    if "heading" not in request or "content" not in request:
        return "Not all parameters were specified", 400

    # Although we implement checks on frontend for max content length
    # but we need to recheck it because frontend code can always be
    # manipulated
    if len(request["heading"]) == "" or len(request["content"]) == "":
        return "Request is empty", 400
    if len(request["heading"]) > 100 or len(request["content"]) > 40960:
        return "Request length too long", 413
    return render(
        f"# {request['heading']}\n\n{request['content']}",
    )
