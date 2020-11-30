import React from "react";
import {
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { RootStyles as Styles } from "../../styles/meta";

class AboutUs extends React.Component<WithStyles<typeof Styles>> {
  
  render() {
    const { classes } = this.props;
    return (
      <div></div>
    );
  }
}

export default withStyles(Styles)(AboutUs);
