import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) =>
    createStyles({
        heading: {
            fontFamily: "'Comfortaa', cursive",
            padding: theme.spacing(1),
        },
        grid: {
            padding: theme.spacing(1)
        }
    });
