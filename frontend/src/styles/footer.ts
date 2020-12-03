import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) =>
    createStyles({
        root: {
            background: "#e2d7d770",
            fontFamily: "'Comfortaa'",
            width: "100%",
        },
        list: {
            listStyleType: "none",
            textAlign: "center",
            "& li": {
                paddingTop: theme.spacing(1),
            },
            "& li a": {
                textDecoration: "none",
                color: "#463c3ceb",
            },
            "& li a:hover": {
                color: "#111",
                textDecoration: "underline",
            },
        },
        logo: {
            paddingLeft: "40px",
            fontFamily: "'Comfortaa'",
        },
    });
