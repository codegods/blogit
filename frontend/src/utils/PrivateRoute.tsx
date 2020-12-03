import React from "react";
import url_for from "./url_for";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { withUserContext, UserContextType } from "./UserContext";

export class PrivateRoute extends Route<
  RouteProps & { context: UserContextType }
> {
  state = {
    loaded: false,
  };

  componentDidMount() {
    let ctx = this.props.context.refresh();
    ctx &&
      ctx
        .then((context) => {
          this.setState({ loaded: true });
        })
        .catch((err) => {
          this.setState({ loaded: true });
        });
  }
  render() {
    if (this.state.loaded) {
      if (this.props.context.username === "") {
        return (
          <Route
            {...this.props}
            component={() => (
              <Redirect
                to={
                  url_for("views.auth.login") +
                  "?next=" +
                  encodeURIComponent(window.location.pathname)
                }
              />
            )}
            render={undefined}
          />
        );
      }

      return <Route {...this.props} />;
    } else {
      return (
        <Backdrop open={true}>
          <CircularProgress />
        </Backdrop>
      );
    }
  }
}

export default withUserContext(PrivateRoute);
