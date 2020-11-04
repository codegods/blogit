from flask import current_app as app, has_request_context


class Model:
    @classmethod
    def from_dict(cls, dictionary: dict):
        for key in dictionary:
            setattr(cls, key, dictionary[key])
        return cls

    @classmethod
    def search(cls, searchstr: str):
        pass

    @classmethod
    def create(
        cls,
        username: str,
        email: str,
        password: str,
        fname: str,
        lname: str = None,
        bString: str = None,
        avatarURL: str = None,
    ):
        pass

    def delete(self):
        pass

    def add_follower(self, follower):
        pass

    def follow(self, username):
        pass

    def get_posts(self):
        pass


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
    result = cursor.fetchall()
    return len(result) and Model.from_dict(result[0])


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
    result = cursor.fetchall()
    return len(result) and Model.from_dict(result[0])
