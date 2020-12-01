import React from "react";
import {
  withStyles,
  WithStyles,
  Card,
  Grid,
  CardMedia,
  CardContent,
  Container,
  Typography,
  IconButton,
} from "@material-ui/core";
import { GitHub } from "@material-ui/icons";
import { AboutUsStyles as Styles } from "../../styles/meta";

class AboutUs extends React.Component<WithStyles<typeof Styles>> {
  render() {
    const { classes } = this.props;
    return (
      <Container className={classes.root}>
        <Typography variant="h4" className={classes.heading}>
          About Us
        </Typography>
        <Typography variant="h5">What is this</Typography>
        <Typography variant="body1" component="p">
          Blogit is an open source blogging app built and maintained by{" "}
          <a
            href="https://github.com/codegods"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            @github/codegods
          </a>
          . Powered by flask and react, it can deliver you the speed you need.
          Although it is being built as a school project, we aim to maintain
          this as an open source website.
        </Typography>
        <Typography variant="h5">License</Typography>
        <Typography variant="body1" component="p">
          Blogit is ditributed under the MIT license. Read the full text{" "}
          <a
            href="https://github.com/codegods/blogit/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
          >
            here
          </a>
          .
        </Typography>
        <Typography variant="h5">Core Team</Typography>
        <Grid container>
          <Grid item sm={6} xs={12}>
            <Card className={classes.CardRoot} elevation={5}>
              <div className={classes.details}>
                <CardContent className={classes.content}>
                  <Typography component="h5" variant="h5">
                    Jalaj Kumar
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Pune, India
                  </Typography>
                </CardContent>
                <div className={classes.icons}>
                  <a
                    href="https://github.com/jalaj-k"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconButton className={classes.iconButton}>
                      <GitHub />
                    </IconButton>
                  </a>
                </div>
              </div>
              <CardMedia
                className={classes.cover}
                image="https://avatars3.githubusercontent.com/u/67556827"
                title="Jalaj"
              />
            </Card>
          </Grid>

          <Grid item sm={6} xs={12}>
            <Card className={classes.CardRoot} elevation={5}>
              <div className={classes.details}>
                <CardContent className={classes.content}>
                  <Typography component="h5" variant="h5">
                    Prathamesh Bhalekar
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Pune, India
                  </Typography>
                </CardContent>
                <div className={classes.icons}>
                  <a
                    href="https://github.com/Prathamesh-B"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconButton className={classes.iconButton}>
                      <GitHub />
                    </IconButton>
                  </a>
                </div>
              </div>
              <CardMedia
                className={classes.cover}
                image="https://avatars2.githubusercontent.com/u/55992548"
                title="Prathamesh"
              />
            </Card>
          </Grid>
        </Grid>
        <p className={classes.social}>
          <img src="https://img.shields.io/github/stars/codegods/blogit?style=social" />
          <img src="https://img.shields.io/github/watchers/codegods/blogit?style=social" />
        </p>
      </Container>
    );
  }
}

export default withStyles(Styles)(AboutUs);
