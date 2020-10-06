import { createStyles, Theme, fade } from "@material-ui/core/styles";

let AppBar = (theme:Theme) => createStyles({
  root: {
    position: "fixed",
  },
  title: {
    flexGrow: 1,
    fontFamily: "Comfortaa, cursive",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    marginRight: theme.spacing(2),
    display: "none",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
      display: "block"
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
  icon: {
    "& svg.MuiSvgIcon-root": {
      fill: theme.palette.grey[200]
    }
  },
});


let Loader = (_theme:Theme) => createStyles({
  progress: {
    width: "40%"
  }
})

let App = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1
  },
  barProxy: theme.mixins.toolbar,
  backdrop: {
    background: `linear-gradient(182deg, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main})`,
    position: "absolute",
    width: "100vw",
    top: theme.mixins.toolbar.height,
    height: "calc(100%/1.6198)",
  },
  logo: {
    position: "absolute",
    bottom: "25%",
    left: theme.spacing(4),
    "& *": {
      color: "#fff",
      fontFamily: '"Comfortaa"',
    },
    "& h5": {
      opacity: 0.7
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      textAlign: "center",
      left: 0
    },
    main: {
      position: "absolute",
      top: "calc(100%/1.3)"
    }
  }
})

export default { AppBar, Loader, App }
