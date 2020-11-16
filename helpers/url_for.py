_url_database = {
    "new": "/create",
    "storage": "/storage/<uuid>",
    
    "views.user": "/u/<username>",
    "views.tags": "/t/<tagname>",
    "views.posts": "/p/<postid>",

    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",

    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.login": "/api/auth/login",

    "api.posts.create": "/api/post/create",
    "api.posts.likes": "/api/post/likes",
    "api.posts.like": "/api/post/like",
    "api.posts.get_comments": "/api/posts/comments",
    "api.posts.comment": "/api/posts/comment",

    "api.uploader": "/api/uploader",

    "api.renderer": "/api/render",

    "api.user_info": "/api/user",

}


def url_for(name: str) -> str:
    try:
        return _url_database[name]
    except KeyError:
        return None
