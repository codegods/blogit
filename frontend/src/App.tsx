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
} from "@material-ui/core";
import {
  SearchOutlined as SearchIcon,
  NotificationsOutlined,
  PersonOutline,
  ExploreOutlined,
} from "@material-ui/icons";
import { Switch, Route } from "react-router-dom";
import { appBarStyles, progressBar } from "./styles/appbar";
import withStyles from "@material-ui/core/styles/withStyles";
import Lazy from "./utils/Lazy";

// Application context interface
interface Context {
  load?: () => null;
  loadOff?: () => null;
}

interface ProgState {
  isLoading: boolean;
}

let ApplicationContext = React.createContext<Context>({});

const Auth = Lazy(() => import("./pages/auth/index"));

let Loader = (context: any) => 
  withStyles(progressBar)(
    class extends React.Component<WithStyles<typeof progressBar>> {
      static contextType = ApplicationContext;
  
      state: ProgState = {
        isLoading: false,
      };
  
      constructor(
        props: WithStyles<typeof progressBar>
      ) {
        super(props);
        this.context = context
        this.context.load = (): void => {
          this.setState({
            isLoading: true,
          });
        };
  
        this.context.loadOff = (): void => {
          this.setState({
            isLoading: false,
          });
        };
      }
      render() {
        const { classes } = this.props;
        if (this.state.isLoading)
          return <LinearProgress className={classes.root} />;
  
        return null;
      }
    }
  );

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
        <ApplicationContext.Provider value={{}}>
          <div>
            <ApplicationContext.Consumer>
              {
                context => <Loader(context) />
              }
            </ApplicationContext.Consumer>
            <Switch>
              <Route path="/auth" component={Auth} />
            </Switch>
          </div>
        </ApplicationContext.Provider>
      </div>
    );
  }
}
export default withStyles(appBarStyles)(App);
