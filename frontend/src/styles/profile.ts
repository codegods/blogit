import { createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => {
    return createStyles({
        header: {
            display: "flex",
            "& > *": {
                margin: theme.spacing(1.5),
            },
        },
        Avatar: {
            height: "auto",
            width: "auto",
            borderRadius: "0%",
            "& img": {
                width: theme.spacing(15),
                height: theme.spacing(15),
                borderRadius: "50%",
                [theme.breakpoints.down("xs")]: {
                    width: theme.spacing(10),
                    height: theme.spacing(10),
                },
            },
        },
        heading: {
            fontFamily: "'Comfortaa', cursive",
            padding: theme.spacing(1),
            "& div.MuiTypography-root": {
                width: "100%",
            },
        },
        follow: {
            "& div": {
                display: "flex",
                flexDirection: "row",
            },
            "& div .MuiTypography-root": {
                fontSize: ".85rem",
                fontWeight: "bold",
                textAlign: "center",
                margin: "0 8px",
                flexGrow: 1
            },
            "& .MuiButton-root": {
                width: "100%"
            }
        },
        content: {
            margin: "8px 0"
        },
        info: {
            textAlign: "center",
            width: "100%"
        }
    });
};
