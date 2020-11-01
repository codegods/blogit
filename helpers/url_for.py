_url_database = {
    "views.user": "/u/<username:str>",
    "views.tags": "/t/<tagname:str>",
    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",
    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.loginin": "/api/auth/login",
    "api.uploader": "/api/uploader",
    "api.renderer": "/api/render",
}


def url_for(name: str) -> str:
    try:
        return _url_database[name]
    except KeyError:
        return None
