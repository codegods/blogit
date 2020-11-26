import flask
import functools
from .url_for import url_for
from typing import Any, Union
from urllib.parse import quote
from itsdangerous.url_safe import URLSafeSerializer
from itsdangerous.exc import BadData, BadSignature


def with_cookie(
    cookie_name: str, cookie_data: Any, response, *args, **kwargs
) -> flask.Response:
    """
    Takes in a response and attaches a signed cookie with the name
    `cookie_name` and data `cookie_data`. This helps verify the
    integrity of the cookie. All cookies are httpOnly and rest of
    the arguments are passed as is to the `flask.Response.set_cookie`
    method.
    """
    serializer = URLSafeSerializer(flask.current_app.config["SECRET_KEY"])
    data = serializer.dumps(cookie_data)
    res = flask.make_response(response)
    res.set_cookie(cookie_name, data, httponly=True, *args, **kwargs)
    return res


def retrieve_cookie(
    cookie_name: str, request: flask.Request = flask.request
) -> Union[str, None]:
    """
    Returns the decoded version of a signed cookie. If the cookie was
    tampered with, then it will return `None`.
    """
    serializer = URLSafeSerializer(flask.current_app.config["SECRET_KEY"])
    try:
        return serializer.loads(request.cookies[cookie_name])
    except (BadSignature, BadData, KeyError):
        # Somebody tampered with the data and its better to return None.
        return None


def login_required(user_needed=False):
    """
    This is a wrapper for those routes which need the user to be logged in.
    If the user isn't logged in then he/she will be redirected to the login
    page. If `user_needed` is set to True then it will inject a user object
    in the flask.g object which is accessible through flask.g.user. This may
    be needed for customised views such as profile, settings, home page, etc.
    """

    def wrapper(view):
        @functools.wraps(view)
        def real_wrapper(*args, **kwargs):
            user_id = retrieve_cookie("l_id")
            is_authenticated = False
            if user_id:

                # Make sure the ip address is the same
                if user_id["ip"] == flask.request.remote_addr:
                    is_authenticated = True
            if is_authenticated:
                del is_authenticated
                if user_needed:
                    flask.g.setdefault(
                        "user",
                        flask.current_app.sql.users.get(email=user_id["email"]),
                    )
                return view(*args, **kwargs)

            # User not authenticated, redirect to login view.
            return (
                flask.redirect(
                    url_for("views.auth.login")
                    + "?next="
                    + quote(flask.request.full_path)
                ),
                403,
            )

        return real_wrapper

    return wrapper
