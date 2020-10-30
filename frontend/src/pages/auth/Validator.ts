import url_for from "../../utils/url_for";

let validate_step_1 = (
    email: string,
    password: string,
    cpassword: string
): Promise<{
    uuid?: string;
    error?: {
        message: string;
        id: string;
    };
}> => {
    let emailString = (document.getElementById(email) as HTMLInputElement)
        .value;
    let passwordString = (document.getElementById(password) as HTMLInputElement)
        .value;
    return new Promise((resolve, _reject) => {
        if (emailString === "") {
            resolve({
                error: {
                    message: "Email is a required field",
                    id: email,
                },
            });
            return;
        }

        if (passwordString === "") {
            resolve({
                error: {
                    message: "Password is a required field",
                    id: password,
                },
            });
            return;
        }

        if (
            passwordString !==
            (document.getElementById(cpassword) as HTMLInputElement).value
        ) {
            resolve({
                error: {
                    message: "The two passwords don't match",
                    id: cpassword,
                },
            });
            return;
        }

        if (
            !(
                // Ensure no capitals and no special characters and yes, an @
                (
                    emailString.match(/[a-z0-9.+-]+@[a-z0-9.+]+/) &&
                    // Make sure that the ending is something like a domain
                    emailString.match(/\.[a-z]+$/)
                )
            )
        ) {
            resolve({
                error: {
                    message: "Email is not valid",
                    id: email,
                },
            });
            return;
        }

        if (passwordString.length < 8) {
            resolve({
                error: {
                    message: "Password is too short",
                    id: password,
                },
            });
            return;
        }

        fetch(url_for("api.auth.signup.validate"), {
            method: "POST",
            body: JSON.stringify({
                step: 0,
                email: emailString,
                password: passwordString,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                resolve(res);
                return;
            })
            .catch((_) => {
                resolve({
                    error: {
                        message:
                            "There was an errror while contacting our server",
                        id: email,
                    },
                });

                return;
            });
    });
};

let validate_step_2 = (
    uuid: string,
    uname: string,
    fname: string,
    lname: string
): Promise<{
    error?: {
        message: string;
        id: string;
    };
}> => {
    return new Promise((resolve, reject) => {
        let uString = (document.getElementById(uname) as HTMLInputElement)
            .value;
        let fString = (document.getElementById(fname) as HTMLInputElement)
            .value;
        let lString = (document.getElementById(lname) as HTMLInputElement)
            .value;
        if (uString === "") {
            resolve({
                error: {
                    message: "Username is a required field",
                    id: uname,
                },
            });
            return;
        }
        if (fString === "") {
            resolve({
                error: {
                    message: "Firstname is a required field",
                    id: fname,
                },
            });
            return;
        }

        fetch(url_for("api.auth.signup.validate"), {
            method: "POST",
            body: JSON.stringify({ uuid, uString, fString, lString, step: 1 }),
        })
            .then((res) => res.json())
            .then((res) => {
                resolve(res);
                return;
            })
            .catch((_) => {
                resolve({
                    error: {
                        message:
                            "There was an errror while contacting our server",
                        id: fname,
                    },
                });

                return;
            });
    });
};

/*let validate_step_3 = (
    uuid: string,
    avatar: string,
    bio: string
): Promise<{
    error?: {
        message: string;
        id: string;
    };
}> => {
    return new Promise((resolve, reject) => {
        let _elem = (document.getElementById(avatar) as HTMLInputElement)
        let AvatarFile = _elem.files && _elem.files[0];
        let bString = (document.getElementById(bio) as HTMLInputElement)
            .value;
/*        if (bString === "") {
            resolve({
                error: {
                    message: "Username is a required field",
                    id: uname,
                },
            });
            return;
        }
        if (fString === "") {
            resolve({
                error: {
                    message: "Firstname is a required field",
                    id: fname,
                },
            });
            return;
        }

        fetch(url_for("api.auth.signup.validate"), {
            method: "POST",
            body: JSON.stringify({ uuid, uString, fString, lString, step: 1 }),
        })
            .then((res) => res.json())
            .then((res) => {
                resolve(res);
                return;
            })
            .catch((_) => {
                resolve({
                    error: {
                        message:
                            "There was an errror while contacting our server",
                        id: fname,
                    },
                });

                return;
            });
    });
};
*/
export default { validate_step_1, validate_step_2 /*, validate_step_3 */};