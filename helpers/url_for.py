# TODO Create API endpoint for post content, stats and author.
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
    "api.posts.create": "/api/posts/create",
    "api.posts.author": "/api/posts/author",
    "api.posts.stats": "/api/posts/stats",
    "api.posts.get": "/api/posts",
    "api.posts.like": "/api/posts/like",
    "api.posts.liked_by_user": "/api/posts/has-user-liked",
    "api.posts.share": "/api/posts/share-count",
    "api.posts.get_comments": "/api/posts/comments",
    "api.posts.comment": "/api/posts/comment",
    "api.posts.get_comment_by_id": "/api/posts/get-comment-by-id",
    "api.uploader": "/api/uploader",
    "api.renderer": "/api/render",
    "api.user_info": "/api/user",
    "api.storage.avatar": "/api/storage/avatar",
    "api.storage.image": "/api/storage/image/<uuid>",
}


def url_for(name: str) -> str:
    try:
        return _url_database[name]
    except KeyError:
        return None
