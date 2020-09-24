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
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  NotificationsOutlined,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Switch, Route } from "react-router-dom";
import appBarStyles from "./styles/appbar";
import Auth from "./pages/auth/index";
import withStyles from "@material-ui/core/styles/withStyles";

interface Props extends WithStyles<typeof appBarStyles> {
  children?: React.ReactElement;
}

class App extends React.Component<Props> {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
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
        <Switch>
          <Route path="/auth" component={Auth} />
        </Switch>
      </div>
    );
  }
}
export default withStyles(appBarStyles)(App);
