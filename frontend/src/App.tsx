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
  Button,
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  NotificationsOutlined,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Switch, Route, Link } from "react-router-dom";
import Styles from "./styles/appbar";
import withStyles from "@material-ui/core/styles/withStyles";

// Lazy load other app pages
const Auth = React.lazy(() => import("./pages/auth/index"));
const HomePage = React.lazy(() => import("./pages/Homepage"));

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
              <Link to="/" className={classes.loginButtons}>
                blogit
              </Link>
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
            {
              /**@todo change this to if user is logged in or not */
              false ? (
                <div>
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
                </div>
              ) : (
                <div>
                  <Button
                    component={Link}
                    to="/auth/login"
                    className={classes.loginButtons}
                    color="secondary"
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/auth/login"
                    className={classes.loginButtons}
                    color="secondary"
                    variant="contained"
                  >
                    Signup
                  </Button>
                </div>
              )
            }
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
        <React.Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/auth/:page" component={Auth} />
          </Switch>
        </React.Suspense>
      </div>
    );
  }
}
export default withStyles(Styles.App)(App);
