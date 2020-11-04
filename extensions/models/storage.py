from flask import current_app as app, has_request_context


class Model:
    @classmethod
    def from_dict(cls, dictionary: dict):
        for key in dictionary:
            setattr(cls, key, dictionary[key])
        return cls
    
    @classmethod
    def upload(cls, name: str, contents: str):
        pass

    def get_data(self):
        pass


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
    cursor.execute("select * from storage where uuid=%s limit 1", (uuid,))
    result = cursor.fetchall()
    return len(result) and Model.from_dict(result[0])
