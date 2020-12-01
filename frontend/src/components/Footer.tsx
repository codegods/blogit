import React from "react";
import {
  withStyles,
  WithStyles,
  Grid,
  Typography,
  List,
  ListItem,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import url_for from "../utils/url_for";
import { RootStyles as Styles } from "../styles/footer";

class Footer extends React.Component<WithStyles<typeof Styles>> {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid item sm={6} xs={12}>
            <ul className={classes.list}>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to={url_for("views.meta.about")}>About us</Link>
              </li>
              <li>
                <Link to={url_for("views.explore")}>Explore</Link>
              </li>
              <li>
                <Link to={url_for("views.auth.login")}>Login</Link>
              </li>
              <li>
                <Link to={url_for("views.auth.signup")}>Signup</Link>
              </li>
            </ul>
          </Grid>
          <Grid item sm={6} xs={12} style={{ textAlign: "center" }}>
            <ul className={classes.list}>
              <li>
                <a target="_blank" href="https://github.com/codegods/blogit">
                  Source Code
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://github.com/codegods/blogit/issues/new?template=bug_report.md"
                >
                  Report a bug
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://github.com/codegods/blogit/issues/new?template=feature_request.md"
                >
                  Feature Request
                </a>
              </li>
            </ul>
            <Typography variant="h2" component="div" className={classes.logo}>
              blogit
            </Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(Styles)(Footer);
