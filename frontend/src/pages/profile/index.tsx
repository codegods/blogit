import React from "react";
import { withStyles, WithStyles, Typography } from "@material-ui/core";
import { RootStyles as Styles } from "../../styles/profile";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

class Profile extends React.Component<WithStyles<typeof Styles>> {
  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.root}>
          <div>
            <Avatar
              alt="Remy Sharp"
              src="/static/images/avatar/1.jpg"
              className={classes.Avatar}
            />
          </div>
          <div>
            <Typography variant="h4" className={classes.heading}>
              User
            </Typography>
            <Typography variant="h5"> Full Name </Typography>
            <Button size="small" variant="outlined" color="primary">
              Follow
            </Button>
            <Typography variant="subtitle1" color="textSecondary">
              Bio
            </Typography>
          </div>
        </div>
        <div className={classes.dis}>
          <br />
          <hr />
          <div>
            <Grid container spacing={3}>
              <Grid item xs>
                <Paper className={classes.paper}>xs</Paper>
              </Grid>
              <Grid item xs>
                <Paper className={classes.paper}>xs</Paper>
              </Grid>
              <Grid item xs>
                <Paper className={classes.paper}>xs</Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs>
                <Paper className={classes.paper}>xs</Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper className={classes.paper}>xs=6</Paper>
              </Grid>
              <Grid item xs>
                <Paper className={classes.paper}>xs</Paper>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(Styles)(Profile);
