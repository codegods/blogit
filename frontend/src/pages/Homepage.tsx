import React from "react";
import { Typography, withStyles, WithStyles } from "@material-ui/core";
import { App } from "../styles/appbar";

let HomePage = withStyles(App)(
  class extends React.Component<WithStyles<typeof App>> {
    render() {
      const { classes } = this.props;
      return (
        <div>
          <div className={classes.backdrop}>
            <div className={classes.logoBackground} />
          </div>
          <main>
            <Typography variant="h3">A better place to write</Typography>
            <Typography variant="body1">
              With blogit you can write whatever
            </Typography>
          </main>
        </div>
      );
    }
  }
);
export default HomePage;
