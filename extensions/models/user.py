import hashlib
import secrets
import datetime
from dataclasses import dataclass
from flask import current_app as app, has_request_context


@dataclass
class Model:
    username: str
    email: str
    password: str
    firstname: str
    avatarurl: str
    bio: str
    lastname: str
    id: str


    def delete(self):
        return app.sql.autocommit("delete from users where Id = ", (self.id,))

    def add_follower(self, follower: str):
        return app.sql.autocommit(
            "insert into followers values (%s, %s)", (self.id, follower)
        )

    def follow(self, username: str):
        return app.sql.autocommit(
            "insert into followers values (%s, %s)", (username, self.id)
        )

    def get_posts(self, limit: int = 10, offset: int = 0):
        csr = app.sql.cursor(dictionary=True)
        csr.execute(
            "select * from posts where Author=%s limit %d offset %d",
            (self.id, limit, offset),
        )
        return csr.fetchall()

    def get_followers(self, limit: int = 10, offset: int = 0):
        csr = app.sql.cursor(dictionary=True)
        csr.execute(
            "select * from followers where Following=%s limit %d offset %d",
            (self.id, limit, offset),
        )
        return csr.fetchall()

    def get_following(self, limit: int = 10, offset: int = 0):
        csr = app.sql.cursor(dictionary=True)
        csr.execute(
            "select * from followers where Follower=%s limit %d offset %d",
            (self.id, limit, offset),
        )
        return csr.fetchall()

    def get_follower_count(self):
        csr = app.sql.cursor()
        csr.execute(
            "select count(*) from followers where Following=%s", (self.id,)
        )
        return csr.fetchall()

    def get_following_count(self):
        csr = app.sql.cursor()
        csr.execute(
            "select count(*) from followers where Follower=%s", (self.id,)
        )
        return csr.fetchall()

def from_dict(dictionary: dict):
    return Model(**dictionary)


def search(searchstr: str, limit: int = 10, offset: int = 0):
    csr = app.sql.cursor(dictionary=True)
    csr.execute(
        "select username, firstname, bio from users where username like %s limit %s offset %s",
        (f"%{searchstr}%", limit, offset),
    )
    return [from_dict(user) for user in csr.fetchall()]


def create(
    username: str,
    email: str,
    password: str,
    fname: str,
    lname: str = None,
    bio: str = None,
    avatarUrl: str = None,
):
    return app.sql.autocommit(
        "insert into users values (%s, %s, %s, %s, %s, %s, %s, %s)",
        (
            hashlib.sha256(
                secrets.token_bytes() + datetime.datetime.now().isoformat().encode()
            ).hexdigest(),  # This will give us a random uuid hash of 32 chars
            username,
            fname,
            email,
            password,
            lname,
            bio,
            avatarUrl,
        ),
    )


def get(email: str = None, username: str = None):
    if not has_request_context():
        raise Exception("A flask request context is needed to work")
    if email:
        return loadByEmail(email)
    elif username is not None:
        return loadByUserName(username)


def loadByUserName(username: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from users where Username=%s limit 1", (username,))
    result = cursor.fetchone()
    return result and from_dict(result)


def loadByEmail(email: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from users where Email=%s limit 1", (email,))
    result = cursor.fetchone()
    return result and from_dict(result)
