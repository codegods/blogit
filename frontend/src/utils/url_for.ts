let _url_database: {
    [index: string]: string;
} = {
    "new": "/create",
    "storage": "/storage/:uuid",
    "views.user": "/u/:username",
    "views.tags": "/t/:tagname",
    "views.posts": "/p/:postid",
    "views.explore": "/explore",
    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",
    "views.meta.about": "/meta/about-us",
    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.login": "/api/auth/login",
    "api.posts.create": "/api/posts/create",
    "api.posts.author": "/api/posts/author",
    "api.posts.stats": "/api/posts/stats",
    "api.posts.get": "/api/posts",
    "api.posts.get_by_author": "/api/posts/authored-by",
    "api.posts.like": "/api/posts/like",
    "api.posts.liked_by_user": "/api/posts/has-user-liked",
    "api.posts.share": "/api/posts/share-count",
    "api.posts.get_comments": "/api/posts/comments",
    "api.posts.comment": "/api/posts/comment",
    "api.posts.get_comment_by_id": "/api/posts/get-comment-by-id",
    "api.posts.explore": "/api/posts/explore/",
    "api.posts.explore.info": "/api/posts/explore/post-info",
    "api.uploader": "/api/uploader",
    "api.renderer": "/api/render",
    "api.user_info": "/api/user",
    "api.user.follow": "/api/user/follow",
    "api.user.has_followed": "/api/user/follow/is-followed-by-me",
    "api.user.info": "/api/user/info",
    "api.storage.avatar": "/api/storage/avatar",
    "api.storage.image": "/api/storage/image/:uuid",
};

let url_for = (name: keyof typeof _url_database): string => {
    return _url_database[name];
};

export default url_for;
