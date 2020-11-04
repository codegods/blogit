from flask import current_app as app, has_request_context


class Model:
    @classmethod
    def from_dict(cls, dictionary: dict):
        for key in dictionary:
            setattr(cls, key, dictionary[key])
        return cls

    @classmethod
    def create(cls, author: str, title: str, content: str):
        pass

    @classmethod
    def search(cls, searchstr: str):
        pass
    
    def delete(self):
        pass

    def like(self, username):
        pass

    def get_likers(self):
        pass

    def get_like_count(self):
        pass
    

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
    return len(result) and Model.from_dict(result[0])


def loadByuuid(uuid: str):
    if not hasattr(app, "sql"):
        raise ValueError(
            "It seems like the database flask extension has not been initialised."
            " Please init it first."
        )
    if not app.sql.is_connected:
        raise Exception("The app is not connected to a mysql server")

    cursor = app.sql.cursor(dictionary=True)
    cursor.execute("select * from posts where uuid=%s limit 1", (uuid,))
    result = cursor.fetchall()
    return len(result) and Model.from_dict(result[0])
