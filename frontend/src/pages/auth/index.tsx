import React from "react";
import {
  Tabs,
  Tab,
  Typography,
  Box,
  Grow,
  Card,
  CardContent,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import SignUp from "./signup";
import SignIn from "./signin";
import { RootStyles } from "../../styles/auth";
import { Switch, Route, Link } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AuthPage extends React.Component {
  handleChange: (_e: React.ChangeEvent<{}>, newValue: number) => void;
  state: {
    value: number;
  };
}

interface AppProps extends WithStyles<typeof RootStyles> {
  history: {
    [index: string]: any;
  };
  match: {
    [index: string]: any;
  };
  location: {
    [index: string]: any;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      <Grow in={value === index}>
        <Box>
          <Typography component="div">{children}</Typography>
        </Box>
      </Grow>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    "aria-controls": `auth-tabpanel-${index}`,
  };
}

class Auth extends React.Component<AppProps> implements AuthPage {
  state: AuthPage["state"];
  constructor(props: AppProps) {
    super(props);
    this.state = {
      value: props.match.params.page === "login" ? 0 : 1,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(_e: React.ChangeEvent<{}>, newValue: number) {
    this.setState({
      value: newValue,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.backdrop} />
        <div className={classes.showText}>
          <Typography variant="h1">blogit</Typography>
          <Typography variant="subtitle1">The new era of blogging</Typography>
        </div>
        <Card className={classes.root}>
          <CardContent>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              aria-label="Sign and Signup Tabs"
              className={classes.tabPanel}
            >
                <Tab
                  component={Link}
                  to="/auth/login"
                  className={classes.tab}
                  label="Sign-In"
                  {...a11yProps(0)}
                />
                <Tab
                  component={Link}
                  to="/auth/signup"
                  className={classes.tab}
                  label="Sign-Up"
                  {...a11yProps(1)}
                />
            </Tabs>
            <TabPanel value={this.state.value} index={0}>
              <SignIn />
            </TabPanel>
            <TabPanel value={this.state.value} index={1}>
              <SignUp />
            </TabPanel>
          </CardContent>
        </Card>
        <Switch>
          <Route
            path="/auth/login"
            component={() => {
              if (this.state.value !== 0) this.setState({ value: 0 });
              return null;
            }}
          />
          <Route
            path="/auth/signup"
            component={() => {
              if (this.state.value !== 1) this.setState({ value: 1 });
              return null;
            }}
          />
        </Switch>
      </div>
    );
  }
}

export default withStyles(RootStyles)(Auth);
