import React from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  Typography,
  WithStyles,
  IconButton,
  Tooltip,
  Button,
  withStyles,
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import { UserContextType, withUserContext } from "../utils/UserContext";
import { AppBar as Styles } from "../styles/appbar";
import url_for from "../utils/url_for";

interface AppBarProps extends WithStyles<typeof Styles> {
  context: UserContextType;
}

// The app bar
class MainAppBar extends React.Component<AppBarProps> {
  render() {
    const { classes } = this.props;
    return (
      <AppBar position="static" className={classes.root}>
        <Toolbar onClick={this.props.context.refresh}>
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
          {this.props.context.username !== "" ? (
            <div>
              <Tooltip title="Explore" aria-label="explore">
                <Link to={url_for("views.explore")}>
                  <IconButton className={classes.icon}>
                    <ExploreOutlined />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title="My Account" aria-label="my account">
                <Link
                  to={url_for("views.user").replace(
                    /:[a-z]+/,
                    this.props.context.username
                  )}
                >
                  <IconButton className={classes.icon}>
                    <PersonOutline />
                  </IconButton>
                </Link>
              </Tooltip>
            </div>
          ) : (
              <div>
                <Button
                  component={Link}
                  to={url_for("views.auth.login")}
                  className={classes.loginButtons}
                  color="secondary"
                >
                  Login
              </Button>
                <Button
                  component={Link}
                  to={url_for("views.auth.signup")}
                  className={classes.loginButtons}
                  color="secondary"
                  variant="contained"
                >
                  Signup
              </Button>
              </div>
            )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(Styles)(withUserContext(MainAppBar));
