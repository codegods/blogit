import secrets
import hashlib
import datetime
from typing import Tuple
from dataclasses import dataclass
from flask import current_app as app, has_request_context


@dataclass
class Model:
    id: str
    content: str
    post: str
    author: str
    date_posted: datetime.datetime


def create(content, author, post):
    uuid = hashlib.sha256(
        secrets.token_bytes() + datetime.datetime.now().isoformat().encode()
    ).hexdigest()
    app.sql.autocommit(
        "insert into comments values (%s, %s, %s, %s, %s)",
        (uuid, author, post, content, datetime.datetime.now()),
    )
    return uuid


def from_dict(dictionary: dict):
    return Model(**dictionary)


def get(post_uuid: str, limits: Tuple[int, int] = (0, 10)):
    if not has_request_context():
        raise Exception("A flask request context is needed to work")

    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor()
    cursor.execute(
        "select id from comments where post=%s limit %d offset %d order by date_posted desc", (post_uuid, *limits)
    )
    result = cursor.fetchall()
    return len(result) and result


def get_by_id(uuid: str):
    if not has_request_context():
        raise Exception("A flask request context is needed to work")

    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from comments where id=%s", (uuid, ))
    result = cursor.fetchone()
    return len(result) and from_dict(result)
