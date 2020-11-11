import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => {
    return createStyles({
        root: {
            position: "absolute",
            width: "100%",
            top: "72px",
        },
        heading: {
            fontFamily: "Comfortaa, cursive",
            padding: theme.spacing(1),
        },
        tabPanel: {
            width: "-webkit-fill-available",
        },
        tab: {
            width: "50%",
        },
        content: {
            padding: theme.spacing(1),
        },
        writer: {
            marginTop: theme.spacing(2)
        },
        fab: {
            position: "fixed",
            bottom: theme.spacing(4),
            right: theme.spacing(4)
        }
    });
};

export let ToolBox = (theme: Theme) => createStyles({
    root: {
        width: "fit-content",
        position: "absolute",
        left: "50%",
        top: "90%",
        transform: "translateX(-50%) translateY(-90%)",
        "& button": {
            padding: theme.spacing(1)
        },
        [theme.breakpoints.down("xs")]: {
            transform: "scale(0.8) translateX(-50%) translateY(-90%)"
        }
    },
    dragger: {
        cursor: "move"
    }
})

export let Preview = (theme: Theme) => createStyles({
    root: {
        fontFamily: "'Montserrat'",
        "& a": {
            textDecoration: "none",
            color: theme.palette.secondary.main
        },
        "& .markdown-mention:hover": {
            textDecoration: "underline"
        }
    }
})
