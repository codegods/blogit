let _url_database: {
  [index: string]: string;
} = {
  "views.auth.login": "/auth/login",
  "views.auth.signup": "/auth/signup",
  "api.auth.signup.validate": "/api/auth/signup/validate/",
  "api.auth.loginin": "/api/auth/login",
};

let url_for = (name: keyof typeof _url_database): string => {
  return _url_database[name];
};

export default url_for;
