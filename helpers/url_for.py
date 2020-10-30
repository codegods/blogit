_url_database = {
    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",
    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.loginin": "/api/auth/login",
    "api.uploader": "/api/uploader"
}


def url_for(name: str) -> str:
    try:
        return _url_database[name]
    except KeyError:
        return None
