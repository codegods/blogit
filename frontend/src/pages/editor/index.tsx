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
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@material-ui/core";
import { Check } from "@material-ui/icons";
import { Redirect } from "react-router-dom";
import Preview from "./preview";
import Writer from "./writer";
import url_for from "../../utils/url_for";
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
    isLoading: boolean;
    error: string;
    redirectTo: string;
  };

  constructor(props: WithStyles<typeof RootStyles>) {
    super(props);
    this.state = {
      value: 0,
      isLoading: false,
      error: "",
      redirectTo: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.create = this.create.bind(this);
  }

  handleChange(_e: React.ChangeEvent<{}>, newValue: number) {
    this.setState({
      value: newValue,
    });
  }

  create() {
    let title = (document.getElementById(
        "create-post-title"
      ) as HTMLInputElement).value,
      content = (document.getElementById(
        "create-post-textarea"
      ) as HTMLTextAreaElement).value;

    if (title === "" || content === "")
      this.setState({
        error: "Please give your post a title and some content to get started.",
      });
    else if (title.length > 100 || content.length > 40960)
      this.setState({
        error:
          "Your title or content seem to be too long please stay within the limit to get started",
      });
    else {
      this.setState({ isLoading: true });
      fetch(url_for("api.posts.create"), {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
        }),
      }).then((res) => {
        res.text().then((txt) => {
          if (!res.ok)
            this.setState({
              isLoading: false,
              error:
                "Couldn't create this post because server responded with: \"" +
                txt +
                "\"\nStatus: " +
                res.status +
                " " +
                res.statusText,
            });
          else
            this.setState({
              isLoading: false,
              redirectTo: txt,
            });
        });
      }).catch(e => console.error(e));
    }
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
          <Writer
            title_id="create-post-title"
            content_id="create-post-textarea"
          />
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
        <Fab
          color="primary"
          variant="extended"
          className={classes.fab}
          onClick={this.create}
        >
          <Check /> Create
        </Fab>
        <Dialog
          disableBackdropClick={this.state.isLoading}
          disableEscapeKeyDown={this.state.isLoading}
          open={this.state.error !== "" || this.state.isLoading}
          onClose={() => this.setState({ error: "", isLoading: false })}
        >
          <DialogTitle>
            {this.state.isLoading ? "Loading..." : "Unable to create post"}
          </DialogTitle>
          <DialogContent>
            {this.state.isLoading ? (
              <div className={classes.flex}>
                <span />
                <CircularProgress />
                <span />
              </div>
            ) : (
              this.state.error
            )}
          </DialogContent>
        </Dialog>
        {this.state.redirectTo !== "" && (
          <Redirect
            to={url_for("views.posts").replace(
              /\/:[a-zA-Z0-9-]+/,
              "/" + this.state.redirectTo
            )}
          />
        )}
      </div>
    );
  }
}

export default withStyles(RootStyles)(CreateAPost);
