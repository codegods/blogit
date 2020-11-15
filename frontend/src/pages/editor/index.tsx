import React from "react";
import {
  Grow,
  Box,
  Fab,
  Tab,
  Tabs,
  withStyles,
  WithStyles,
  Typography,
} from "@material-ui/core";
import { Check } from "@material-ui/icons";
import Preview from "./preview";
import Writer from "./writer"
import { RootStyles } from "../../styles/editor";

interface TabPanelProps extends React.ComponentProps<"div"> {
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
      id={`create-tabpanel-${index}`}
      aria-labelledby={`create-tab-${index}`}
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

class CreateAPost extends React.Component<WithStyles<typeof RootStyles>> {
  state: {
    value: number;
  };

  constructor(props: WithStyles<typeof RootStyles>) {
    super(props);
    this.state = {
      value: 0,
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
      <div className={classes.root}>
        <Typography variant="h4" className={classes.heading}>
          Create a new post
        </Typography>
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          aria-label="Create and preview a new post"
          className={classes.tabPanel}
        >
          <Tab
            className={classes.tab}
            label="Write"
            id="create-tab-0"
            aria-controls="create-tabpanel-0"
          />
          <Tab
            className={classes.tab}
            label="Preview"
            id="create-tab-1"
            aria-controls="create-tabpanel-1"
          />
        </Tabs>
        <TabPanel
          className={classes.content}
          value={this.state.value}
          index={0}
        >
          <Writer />
        </TabPanel>
        <TabPanel
          className={classes.content}
          value={this.state.value}
          index={1}
        >
          {/*Previwer */}
          <Preview
            key={String(this.state.value === 1)}
            heading="create-post-title"
            content="create-post-textarea"
            show={this.state.value === 1}
          />
        </TabPanel>
        <Fab color="primary" variant="extended" className={classes.fab}>
          <Check /> Create
        </Fab>
      </div>
    );
  }
}

export default withStyles(RootStyles)(CreateAPost);
