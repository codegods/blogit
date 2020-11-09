import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => {
    console.log(theme);
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
