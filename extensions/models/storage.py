import re
import base64
import hashlib
import secrets
import datetime
from dataclasses import dataclass
from typing import Optional, Union
from flask import current_app as app, has_request_context


@dataclass
class Model:
    name: str
    id: str
    contents: str

    def delete(self):
        app.sql.autocommit("delete from storage where id=%s", (self.id,))

    def get_mimetype(self) -> Union[str, None]:
        match = re.match("^data:(?P<mime>[a-zA-Z0-9/]+);base64,", self.contents)
        return match and match.groupdict()["mime"]

    def get_contents(self) -> Union[str, None]:
        match = re.match(
            "data:[a-zA-Z]+/[a-zA-Z0-9]+;base64,(?P<contents>.+)", self.contents
        )
        return match and match.groupdict()["contents"]

    def get_bytes(self) -> Union[bytes, None]:
        contents = self.get_contents()
        return contents and base64.b64decode(contents.encode())


def from_dict(dictionary: dict):
    return Model(**dictionary)


def upload(name: str, contents: str):
    id = hashlib.sha256(
        secrets.token_bytes() + datetime.datetime.now().isoformat().encode()
    ).hexdigest()  # This will give us a random uuid hash of 32 chars
    if len(name) > 32:
        name = name[:32]
    app.sql.autocommit("insert into storage values (%s, %s, %s)", (id, name, contents))
    return id


def get(uuid: str):
    if not has_request_context():
        raise Exception("A flask request context is needed to work")
    return findByUUID(uuid)


def findByUUID(uuid: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from storage where id=%s limit 1", (uuid,))
    result = cursor.fetchone()
    return result and from_dict(result)
