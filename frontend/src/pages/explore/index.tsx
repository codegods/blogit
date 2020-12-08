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
import Post from "../../components/Post";
import { RootStyles as Styles } from "../../styles/explore";
import url_for from "../../utils/url_for";
type PostContent = Array<{
  id: string;
  likes: number;
  shares: number;
  comments: number;
  title: string;
  name: string;
}>;

class Explore extends React.Component<WithStyles<typeof Styles>> {
  state: {
    content: {
      followers: PostContent;
      liked: PostContent;
      recents: PostContent;
    } | null;
  };
  constructor(props: WithStyles<typeof Styles>) {
    super(props);
    this.state = {
      content: null,
    };
  }
  componentDidMount() {
    document.title = "Explore | Blogit"
    fetch(url_for("api.posts.explore")).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          this.setState({
            content: json,
          });
        });
      } else {
        alert(
          `Failed to load content: ${res.status} ${res.statusText}.\n\nPlease reload he page to retry.`
        );
      }
    });
  }
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
                {this.state.content ? (
                  <CardContent>
                    {this.state.content.followers.length ? (
                      this.state.content.followers.map((content) => (
                        <Post content={content} key={content.id + Math.random()} />
                      ))
                    ) : (
                      <i>No content to show :(</i>
                    )}
                  </CardContent>
                ) : (
                  <CardContent>
                    <Skeleton width="90%" />
                    <Skeleton width="50%" />
                  </CardContent>
                )}
              </Card>
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={6}>
              <Card elevation={12} square>
                <CardHeader title="Most liked" />
                {this.state.content ? (
                  <CardContent>
                    {this.state.content.liked.length ? (
                      this.state.content.liked.map((content) => (
                        <Post content={content} key={content.id + Math.random()} />
                      ))
                    ) : (
                      <span>No content to show</span>
                    )}
                  </CardContent>
                ) : (
                  <CardContent>
                    <Skeleton width="90%" />
                    <Skeleton width="50%" />
                  </CardContent>
                )}
              </Card>
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={12}>
              <Card elevation={12} square>
                <CardHeader title="Recent additions" />
                {this.state.content ? (
                  <CardContent>
                  {this.state.content.recents.length ? (
                    this.state.content.recents.map((content) => (
                      <Post content={content} key={content.id + Math.random()} />
                    ))
                  ) : (
                    <i>No content to show :(</i>
                  )}
                </CardContent>
                ) : (
                  <CardContent>
                    <Skeleton width="90%" />
                    <Skeleton width="50%" />
                  </CardContent>
                )}
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default withStyles(Styles)(Explore);
