let _url_database: {
    [index: string]: string;
} = {
    "views.user": "/u/:username",
    "views.tags": "/t/:tagname",
    "views.auth.login": "/auth/login",
    "views.auth.signup": "/auth/signup",
    "api.auth.signup.validate": "/api/auth/signup/validate/",
    "api.auth.login": "/api/auth/login",
    "api.uploader": "/api/uploader",
    "storage": "/storage/:id"
};

let url_for = (name: keyof typeof _url_database): string => {
    return _url_database[name];
};

export default url_for;
