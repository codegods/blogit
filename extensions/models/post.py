import secrets
import hashlib
import datetime
from dataclasses import dataclass
from flask import current_app as app, has_request_context


@dataclass
class Model:
    id: str
    title: str
    author: str
    content: str
    share_count: int
    date_posted: datetime

    def delete(self):
        return app.sql.autocommit("delete from posts where id = %s", (self.id))

    # TODO Untested method
    def like(self, username: str):
        csr = app.sql.cursor()
        csr.execute("select from likes where likee=%s and post=%s", (username, self.id))
        try:
            csr.fetchone()
            raise ValueError("User has alreay liked the post")
        except Exception:
            return app.sql.autocommit(
                "insert into likes values (%s, %s)", (username, self.id)
            )

    def get_stats(self):
        csr = app.sql.cursor(dictionary=True)
        csr.execute(
            "SELECT "
            "COUNT(likes.likee) AS 'likes', "
            "COUNT(comments.id) AS 'comments', "
            "posts.share_count AS 'shares' "
            "FROM ("
            "(posts LEFT JOIN likes ON posts.id=likes.post) "
            "LEFT JOIN comments ON comments.post=posts.id"
            ") "
            "WHERE posts.id=%s "
            "GROUP BY posts.id;",
            (self.id,),
        )
        return csr.fetchone()

    def get_author(self):
        csr = app.sql.cursor(dictionary=True)
        csr.execute(
            "select "
            'avatarurl as "avatar", '
            'concat(firstname, " ", lastname) as "name", '
            "username "
            "from users "
            "where username=%s",
            (self.author,),
        )
        return csr.fetchone()


def from_dict(dictionary: dict):
    return Model(**dictionary)


def create(author: str, title: str, content: str):
    uuid = hashlib.sha256(
        secrets.token_bytes() + datetime.datetime.now().isoformat().encode()
    ).hexdigest()
    app.sql.autocommit(
        "insert into posts values (%s, %s, %s, %s, %s, 0)",
        (uuid, author, datetime.datetime.now(), title, content),
    )
    return uuid


def search(searchstr: str, limit: int = 10, offset: int = 0):
    csr = app.sql.cursor(dictionary=True)
    csr.execute(
        "select id, title, date_posted from posts where author like %s limit %s offset %s",
        (f"%{searchstr}%", limit, offset),
    )
    return [from_dict(post) for post in csr.fetchall()]


def get(uuid: str = None, author: str = None):
    if not has_request_context():
        raise Exception("A flask request context is needed to work")
    if uuid:
        return loadByuuid(uuid)
    elif author is not None:
        return loadByauthor(author)


def loadByauthor(author: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from posts where author=%s limit 1", (author,))
    result = cursor.fetchall()
    return len(result) and from_dict(result[0])


def loadByuuid(uuid: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from posts where id=%s limit 1", (uuid,))
    result = cursor.fetchall()
    return len(result) and from_dict(result[0])
