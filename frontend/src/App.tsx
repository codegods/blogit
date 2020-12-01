import React from "react";
import {
  WithStyles,
  CircularProgress,
  Backdrop,
  Fab,
  Tooltip,
  withStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Switch, Route, Link } from "react-router-dom";
import AppBar from "./components/AppBar";
import Footer from "./components/Footer";

import Styles from "./styles/appbar";
import url_for from "./utils/url_for";
import PrivateRoute from "./utils/PrivateRoute";

// Lazy load other app pages
const Auth = React.lazy(() => import("./pages/auth/index"));
const HomePage = React.lazy(() => import("./components/Homepage"));
const CreateNew = React.lazy(() => import("./pages/editor/index"));
const Post = React.lazy(() => import("./pages/posts/index"));
const Explore = React.lazy(() => import("./pages/explore/index"));
const Profile = React.lazy(() => import("./pages/profile/index"));
const AboutUs = React.lazy(() => import("./pages/meta/about"));

// Fallback to show when any page is in loading state
let Loader = withStyles(Styles.Loader)(
  class extends React.Component<WithStyles<typeof Styles.Loader>> {
    render() {
      const { classes } = this.props;
      return (
        <Backdrop open={true}>
          <CircularProgress className={classes.progress} />
        </Backdrop>
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
        <AppBar />
        <Link to={url_for("new")}>
          <Tooltip title="Create a new post">
            <Fab className={classes.new_post} color="primary">
              <Add />
            </Fab>
          </Tooltip>
        </Link>
        <div className={classes.barProxy} />
        <React.Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/auth/:page" component={Auth} />
            <Route path={url_for("views.posts")} component={Post} />
            <Route path={url_for("views.user")} component={Profile} />
            <Route path={url_for("views.meta.about")} component={AboutUs} />
            <PrivateRoute path={url_for("new")} component={CreateNew} />
            <PrivateRoute path={url_for("views.explore")} component={Explore} />
          </Switch>
        </React.Suspense>
        <Footer />
      </div>
    );
  }
}
export default withStyles(Styles.App)(App);
