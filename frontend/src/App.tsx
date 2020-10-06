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
  Backdrop
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  NotificationsOutlined,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Switch, Route } from "react-router-dom";
import { appBarStyles, LoaderStyles } from "./styles/appbar";
import withStyles from "@material-ui/core/styles/withStyles";


const Auth = React.lazy(() => import("./pages/auth/index"));

let Loader = withStyles(LoaderStyles)(
  class extends React.Component<WithStyles<typeof LoaderStyles>>{
  render(){
    const { classes } = this.props;
    return (
      <Backdrop open={true}>
        <LinearProgress className={classes.progress} />
      </Backdrop>
    )
  }
})

class App extends React.Component<WithStyles<typeof appBarStyles>> {
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
        <React.Suspense fallback={
          <Loader />
        }>
            <Switch>
              <Route path="/auth" component={Auth} />
            </Switch>
        </React.Suspense>
      </div>
    );
  }
}
export default withStyles(appBarStyles)(App);
