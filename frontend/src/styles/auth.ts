import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

export let RootStyles = (theme: Theme) => createStyles({
  root: {
    "& a": {
      textDecoration: "none",
      color: theme.palette.primary.main
    },
    flexGrow: 1,
    width: "fit-content",
    margin: theme.spacing(8, 2, 2, 2),
    position: "absolute",
    left: "0",
    top: "45%",
    transform: "translateY(-50%)",
    [theme.breakpoints.up("md")]: {
      top: "50%",
      left: "80% !important",
      transform: "translateX(-80%) translateY(-50%) !important",
    },
    [theme.breakpoints.up("sm")]: {
      left: "50%",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%)",
      margin: theme.spacing(8, 0, 0, 0),
    },
  },
  tabPanel: {
    width: "-webkit-fill-available",
  },
  tab: {
    width: "50%",
  },
  backdrop: {
    background: `linear-gradient(182deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main})`,
    position: "absolute",
    width: "100vw",
    height: "75vh",
  },
  showText: {
    position: "absolute",
    top: "40%",
    left: "calc(25% - 64px)",
    transform: "translate(-25%, -40%) scale(1.3)",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    "& .MuiTypography-root": {
      fontFamily: "Comfortaa, cursive",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
});

export let signin = makeStyles((theme: Theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export let signup = (theme: Theme) => createStyles({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  submit: {
    width: "80%",
    textAlign: "center",
    marginTop: theme.spacing(1)
  },
  progress: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
  },
  hidden: {
    display: "none"
  }
})