import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => {
    return createStyles({
        root: {
            width: "100%",
            padding: theme.spacing(1),
        },
        author: {
            width: "40%",
        },
        actions: {
            position: "fixed",
            right: theme.spacing(4),
            bottom: theme.spacing(4),
            height: "56px",
            display: "flex",
            justifyContent: "center",
        },
        actionButton: {
            flex: 1,
            color: theme.palette.primary.main,
            padding: "6px 12px 8px",
            maxWidth: "168px",
        },
        actionsWrapper: {
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: theme.spacing(1),
        },
        post: {
            fontFamily: "'Montserrat'",
            "& a": {
                textDecoration: "none",
                color: theme.palette.secondary.main,
                "&:hover": {
                    textDecoration: "underline",
                },
            },
            "& .markdown-mention:hover": {
                textDecoration: "underline",
            },
            "& pre": {
                backgroundColor: "#ccc",
                padding: theme.spacing(1),
                borderRadius: "4px",
            },
            "& .markdown-highlight": {
                background: theme.palette.secondary.light,
            },
            "& blockquote": {
                marginLeft: 0,
                borderLeft: "3px solid #aaa",
                paddingLeft: theme.spacing(2),
            },
        },
        avatar: {
            width: "3em",
            height: "3em",
            border: "1px solid grey",
            borderRadius: "50%",
        },
        uname: {
            textDecoration: "none",
            color: "#222",
            "&:hover": {
                textDecoration: "underline",
            },
        },
    });
};
