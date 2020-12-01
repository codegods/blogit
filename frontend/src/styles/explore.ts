import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) =>
    createStyles({
        heading: {
            fontFamily: "'Comfortaa', cursive",
            padding: theme.spacing(1),
        },
        grid: {
            padding: theme.spacing(1),
        },
    });

export let PostStyles = (theme: Theme) => createStyles({
    root: {
        marginTop: theme.spacing(1)
    },
    actionButton: {
        flex: 1,
        color: theme.palette.primary.main,
        padding: "0px 8px",
        maxWidth: "168px",
    },
    actionsWrapper: {
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
    },
    link: {
        textDecoration: "none",
        color: "#111",
        "&:hover": {
            textDecoration: "underline"
        }
    }
});
