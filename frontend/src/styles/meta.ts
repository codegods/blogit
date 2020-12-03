import { createStyles, Theme } from "@material-ui/core/styles";

export let AboutUsStyles = (theme: Theme) =>
    createStyles({
        root: {
            "& .MuiTypography-root": {
                marginBottom: theme.spacing(1),
            },
            "& p": {
                padding: theme.spacing(1),
            },
        },
        heading: {
            fontFamily: "'Comfortaa', cursive",
            padding: theme.spacing(1),
        },
        CardRoot: {
            display: "flex",
            margin: theme.spacing(2),
        },
        details: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
        },
        content: {
            flex: "1 0 auto",
        },
        cover: {
            width: 151,
        },
        icons: {
            display: "flex",
            alignItems: "center",
            paddingLeft: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        iconButton: {
            position: "inherit",
        },
        link: {
            textDecoration: "none",
            color: theme.palette.secondary.main,
            "&:hover": {
                textDecoration: "underline",
            },
        },
        social: {
            margin: theme.spacing(2),
            width: "100%",
            textAlign: "center",
            "& img": {
                padding: theme.spacing(1),
            },
        },
    });
