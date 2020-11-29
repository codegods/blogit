import React from "react";
import {
  Typography,
  Card,
  Grid,
  withStyles,
  WithStyles,
  CardHeader,
  CardContent,
  Container,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { RootStyles as Styles } from "../../styles/explore";

class Explore extends React.Component<WithStyles<typeof Styles>> {
  state: {
    followers: string[] | null;
    recents: string[] | null;
    most_liked: string[] | null;
  };
  constructor(props: WithStyles<typeof Styles>) {
    super(props);
    this.state = {
      followers: null,
      recents: null,
      most_liked: null,
    };
  }
  componentDidMount() {}
  render() {
    const { classes } = this.props;
    return (
      <div>
        <Typography variant="h4" className={classes.heading}>
          Explore
        </Typography>
        <Container>
          <Grid container>
            <Grid item className={classes.grid} xs={12} sm={6}>
              <Card elevation={12} square>
                <CardHeader title="From the people you follow" />
                <CardContent>
                  <Skeleton width="90%" />
                  <Skeleton width="50%" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={6}>
              <Card elevation={12} square>
                <CardHeader title="Most liked" />
                <CardContent>
                  <Skeleton width="90%" />
                  <Skeleton width="50%" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={12}>
              <Card elevation={12} square>
                <CardHeader title="Recent additions" />
                <CardContent>
                  <Skeleton width="90%" />
                  <Skeleton width="50%" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default withStyles(Styles)(Explore);
