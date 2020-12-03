import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => {
    return createStyles({
        root: {
            display: "flex",
            "& > *": {
                margin: theme.spacing(1.5),
            },
        },
        dis: {
            display: "normal",
        },
        Avatar: {
            width: theme.spacing(15),
            height: theme.spacing(15),
        },
        heading: {
            fontFamily: "'Comfortaa', cursive",
        },
        sub_heading: {
            fontFamily: "'Comfortaa', cursive",
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: "center",
            color: theme.palette.text.secondary,
        },
    });
};
