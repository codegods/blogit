import React from "react";
import {
  withStyles,
  WithStyles,
  Typography,
  Avatar,
  Grid,
  Button,
  Container,
  CircularProgress,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { RouteComponentProps } from "react-router-dom";
import Post from "../../components/Post";
import url_for from "../../utils/url_for";
import { RootStyles as Styles } from "../../styles/profile";

type ProfileProps = WithStyles<typeof Styles> &
  RouteComponentProps<{
    username: string;
  }>;

class Profile extends React.Component<ProfileProps> {
  state: {
    userInfo: {
      name: string;
      uuid: string;
      username: string;
      followers: number;
      following: number;
      bio: string;
    } | null;
    has_user_followed: boolean;
    error: boolean;
    posts: Array<{
      id: string;
      likes: number;
      shares: number;
      comments: number;
      title: string;
      name: string;
    }> | null;
  };
  constructor(props: ProfileProps) {
    super(props);
    this.state = {
      userInfo: null,
      has_user_followed: false,
      error: false,
      posts: null,
    };
    this.load_user = this.load_user.bind(this);
    this.load_posts = this.load_posts.bind(this);
    this.follow = this.follow.bind(this);
    this.is_following = this.is_following.bind(this);
  }
  load_user() {
    document.title = this.props.match.params.username + " on blogit";
    fetch(
      url_for("api.user.info") + "?uname=" + this.props.match.params.username
    ).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          this.setState({ userInfo: json });
          this.load_posts();
        });
      } else {
        this.setState({
          userInfo: {
            name: "Failed to load",
            fullName: "",
            followers: 0,
            id: "",
            following: 0,
            bio: `Server responded with status: ${res.status} (${res.statusText})`,
          },
          posts: [],
          error: true,
          has_user_followed: false,
        });
      }
    });
  }
  load_posts() {
    fetch(
      url_for("api.posts.get_by_author") +
        "?uname=" +
        this.props.match.params.username
    ).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          this.setState({ posts: json.posts });
        });
        this.is_following();
      } else {
        this.setState({
          userInfo: {
            name: "Failed to load",
            fullName: "",
            followers: 0,
            id: "",
            following: 0,
            bio: `Server responded with status: ${res.status} (${res.statusText})`,
          },
          posts: [],
          has_user_followed: false,
          error: true,
        });
      }
    });
  }
  follow() {
    this.state.userInfo &&
      fetch(
        url_for("api.user.follow") + "?to_follow=" + this.state.userInfo.uuid
      ).then((res) => {
        if (res.ok) {
          let prev = this.state.userInfo!;
          prev.followers += 1;
          this.setState({ has_user_followed: true, userInfo: prev });
        } else
          alert(
            `Failed to follow ${this.props.match.params.username}.\n\nServer responded with ${res.status} ${res.statusText}`
          );
      });
  }
  is_following() {
    this.state.userInfo &&
      fetch(
        url_for("api.user.has_followed") + "?uuid=" + this.state.userInfo.uuid
      ).then((res) => {
        if (res.ok)
          res
            .text()
            .then((txt) =>
              this.setState({ has_user_followed: txt === "true" })
            );
        else this.setState({ has_user_followed: true });
      });
  }
  componentDidMount() {
    this.load_user();
  }
  render() {
    if (
      !this.state.error &&
      this.state.userInfo &&
      this.state.userInfo.username !== this.props.match.params.username
    ) {
      // Sometimes when the url changes, the page doesn't reload.
      // So, we fetch it asynchronously
      new Promise(() => this.load_user());
    }
    const { classes } = this.props;
    return (
      <Container>
        <div className={classes.header}>
          <Avatar
            alt={this.props.match.params.username}
            src={
              url_for("api.storage.avatar") +
              "?user=" +
              this.props.match.params.username
            }
            className={classes.Avatar}
          />
          <div>
            {this.state.userInfo ? (
              <div className={classes.heading}>
                <Typography component="div" variant="h4">
                  {this.state.userInfo.username}
                </Typography>
                <Typography component="div" variant="h5">
                  {this.state.userInfo.name}
                </Typography>
              </div>
            ) : (
              <div className={classes.heading}>
                <Skeleton width="30vw" height="40px" />
                <Skeleton width="20vw" height="30px" />
              </div>
            )}

            {this.state.userInfo ? (
              <Typography variant="subtitle1" color="textSecondary">
                {this.state.userInfo.bio}
              </Typography>
            ) : (
              <Skeleton width="40vw" height="30px" />
            )}
            <div className={classes.follow}>
              {this.state.userInfo ? (
                <div>
                  <Typography component="b">
                    {this.state.userInfo.followers} follower
                    {this.state.userInfo.followers !== 1 && "s"}
                  </Typography>
                  <Typography component="b">
                    {this.state.userInfo.following} following
                  </Typography>
                </div>
              ) : (
                <Skeleton />
              )}
              <Button
                variant="contained"
                color="primary"
                disabled={this.state.has_user_followed}
                onClick={this.follow}
              >
                {this.state.has_user_followed ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
        <div>
          <hr />
          <div>
            <Grid className={classes.content} container spacing={3}>
              {this.state.posts ? (
                this.state.posts.length ? (
                  this.state.posts.map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post.id}>
                      <Post content={post} />
                    </Grid>
                  ))
                ) : (
                  <i className={classes.info}>No posts yet</i>
                )
              ) : (
                <Grid item xs={12} className={classes.info}>
                  <CircularProgress />
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </Container>
    );
  }
}

export default withStyles(Styles)(Profile);
