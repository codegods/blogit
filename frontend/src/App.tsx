import React from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  Typography,
  WithStyles,
  Badge,
  IconButton,
  Tooltip,
  LinearProgress,
  Backdrop,
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  NotificationsOutlined,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Switch, Route } from "react-router-dom";
import Styles from "./styles/appbar";
import withStyles from "@material-ui/core/styles/withStyles";

// Lazy load other app pages
const Auth = React.lazy(() => import("./pages/auth/index"));

// Fallback to show when any page is in loading state
let Loader = withStyles(Styles.Loader)(
  class extends React.Component<WithStyles<typeof Styles.Loader>> {
    render() {
      const { classes } = this.props;
      return (
        <Backdrop open={true}>
          <LinearProgress className={classes.progress} />
        </Backdrop>
      );
    }
  }
);

// The app bar
let MainAppBar = withStyles(Styles.AppBar)(
  class extends React.Component<WithStyles<typeof Styles.AppBar>> {
    render() {
      const { classes } = this.props;
      return (
        <AppBar position="static" className={classes.root}>
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              blogit
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ "aria-label": "search" }}
              />
            </div>
            <Tooltip title="Notifications" aria-label="notifications">
              <IconButton className={classes.icon}>
                <Badge max={9} badgeContent={7} color="secondary">
                  <NotificationsOutlined />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Explore" aria-label="explore">
              <IconButton className={classes.icon}>
                <ExploreOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="My Account" aria-label="my account">
              <IconButton className={classes.icon}>
                <PersonOutline />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      );
    }
  }
);

// The main app
class App extends React.Component<WithStyles<typeof Styles.App>> {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <MainAppBar />
        <div className={classes.barProxy} />
        <div className={classes.backdrop}>
          <div className={classes.logo}>
            <Typography variant="h1">
              blogit
            </Typography>
            <Typography variant="h5">
              The new era of blogging
            </Typography>
          </div>
        </div>
        <main className={classes.main}>
          <Typography variant="h3">
            A better place to write
          </Typography>
          <Typography variant="body1">
            With blogit you can write whatever
          </Typography>
        </main>
        <React.Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/auth" component={Auth} />
          </Switch>
        </React.Suspense>
      </div>
    );
  }
}
export default withStyles(Styles.App)(App);
