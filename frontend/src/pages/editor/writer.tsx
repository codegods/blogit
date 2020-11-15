import React from "react";
import { TextField, withStyles, WithStyles } from "@material-ui/core";
import Toolbox from "./toolbox";
import { RootStyles } from "../../styles/editor";

class Writer extends React.Component<WithStyles<typeof RootStyles>> {
  state = {
    titleLength: 0,
    contentLength: 0,
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <TextField
          variant="filled"
          id="create-post-title"
          fullWidth
          label="Give it that perfect title"
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
              titleLength: evt.target.value.length,
            });
          }}
          error={this.state.titleLength > 100}
          helperText={
            this.state.titleLength +
            "/100" +
            (this.state.titleLength > 100 ? " Heading too long" : "")
          }
        />
        <TextField
          variant="filled"
          fullWidth
          label="Your content goes here"
          multiline
          className={classes.writer}
          rows={10}
          id="create-post-textarea"
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
            this.setState({
              contentLength: evt.target.value.length,
            });
          }}
          error={this.state.contentLength > 40960}
          helperText={
            this.state.contentLength +
            "/40960" +
            (this.state.contentLength > 40960 ? " Content too long" : "")
          }
        />
        <Toolbox textarea="create-post-textarea" />
      </div>
    );
  }
}

export default withStyles(RootStyles)(Writer);
