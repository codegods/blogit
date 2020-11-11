import React from "react";
import {
  WithStyles,
  CircularProgress,
  Backdrop,
  withStyles
} from "@material-ui/core";
import { Switch, Route } from "react-router-dom";
import AppBar from "./AppBar";

import Styles from "./styles/appbar";
import url_for from "./utils/url_for";

// Lazy load other app pages
const Auth = React.lazy(() => import("./pages/auth/index"));
const HomePage = React.lazy(() => import("./pages/Homepage"));
const CreateNew = React.lazy(() => import("./pages/editor/index"));

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
        <React.Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/auth/:page" component={Auth} />
            <Route path={url_for("new")} component={CreateNew} />
          </Switch>
        </React.Suspense>
      </div>
    );
  }
}
export default withStyles(Styles.App)(App);
