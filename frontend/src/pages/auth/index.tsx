import React from "react";
import {
  Tabs,
  Tab,
  Typography,
  Box,
  Grow,
  Card,
  CardContent,
} from "@material-ui/core";
import SignUp from "./signup";
import SignIn from "./signin";
import { root as useStyles } from "../../styles/auth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

export default function Auth() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (_e: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

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
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
            className={classes.tabPanel}
          >
            <Tab className={classes.tab} label="Sign-In" {...a11yProps(0)} />
            <Tab className={classes.tab} label="Sign-Up" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <SignIn />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SignUp />
          </TabPanel>
        </CardContent>
      </Card>
    </div>
  );
}
