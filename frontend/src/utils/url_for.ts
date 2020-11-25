let _url_database: {
    [index: string]: string;
} = {
    new: "/create",
    storage: "/storage/:uuid",

    "views.user": "/u/:username",
    "views.tags": "/t/:tagname",
    "views.posts": "/p/:postid",

    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",

    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.login": "/api/auth/login",

    "api.posts.create": "/api/post/create",
    "api.posts.get": "/api/post",
    "api.posts.stats": "/api/post/stats",
    "api.posts.like": "/api/post/like",
    "api.posts.get_comments": "/api/posts/comments",
    "api.posts.comment": "/api/posts/comment",

    "api.uploader": "/api/uploader",

    "api.renderer": "/api/render",

    "api.user_info": "/api/user",
    "api.storage.avatar": "/api/storage/avatar",
    "api.storage.image": "/api/storage/image/:uuid",
};

let url_for = (name: keyof typeof _url_database): string => {
    return _url_database[name];
};

export default url_for;
