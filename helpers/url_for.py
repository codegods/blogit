_url_database = {
    "views.user": "/u/<username>",
    "views.tags": "/t/<tagname>",
    "views.posts": "/p/<postid>",
    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",
    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.login": "/api/auth/login",
    "api.uploader": "/api/uploader",
    "api.renderer": "/api/render",
    "api.user_info": "/api/user",
    "storage": "/storage/<uuid>",
    "new": "/create"
}


def url_for(name: str) -> str:
    try:
        return _url_database[name]
    except KeyError:
        return None
