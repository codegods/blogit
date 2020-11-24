import React from "react";
import { withStyles, WithStyles, Grid, Button } from "@material-ui/core";
import { Favorite, FavoriteBorder, Share, Chat } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { RouteComponentProps } from "react-router-dom";
import { RootStyles as Styles } from "../../styles/post";
import url_for from "../../utils/url_for";

type Props = RouteComponentProps<{
  postid: string;
}> &
  WithStyles<typeof Styles>;

class Post extends React.Component<Props> {
  state: {
    loaded: boolean;
    post: {
      title: string;
      content: string;
    } | null;
    author: {
      username: string;
      avatar: string;
      name: string;
    } | null;
    stats: {
      shares: number;
      likes: number;
      comments: number;
    } | null;
    liked_by_user: boolean;
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      post: null,
      author: null,
      stats: null,
      liked_by_user: false,
    };
    this.load_author = this.load_author.bind(this);
    this.load_post = this.load_post.bind(this);
    this.load_stats = this.load_stats.bind(this);
  }
  load_post() {
    fetch(url_for("api.posts.get"))
      .then((res) => {
        if (res.ok) return res.json();
        else
          throw Error(
            `Server gave an invalid response code: ${res.status}. Reponse String: ${res.statusText}`
          );
      })
      .catch((err) => {})
      .then((json) => {
        this.setState(json);
        this.load_stats();
      });
  }
  load_stats() {}
  load_author() {}
  componentDidMount() {
    this.load_post();
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Skeleton animation="wave" width="90vw">
          <h1>Loading...</h1>
        </Skeleton>
        <Grid container className={classes.author}>
          <Grid item xs={5} sm={3}>
            <Skeleton
              animation="wave"
              width="3em"
              height="3em"
              variant="circle"
            />
          </Grid>
          <Grid item xs={7} sm={9}>
            <Skeleton animation="wave" height="1.3em" width="30vw" />
            <Skeleton animation="wave" height="1.3em" width="15vw" />
          </Grid>
        </Grid>

        <Skeleton animation="wave" width="90%" />
        <Skeleton animation="wave" width="90%" />

        <div className={classes.actions}>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              {this.state.liked_by_user ? <Favorite /> : <FavoriteBorder />}
              <span>{this.state.stats ? this.state.stats.likes : 0}</span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Chat />
              <span>{this.state.stats ? this.state.stats.comments : 0}</span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Share />
              <span>{this.state.stats ? this.state.stats.shares : 0}</span>
            </span>
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(Styles)(Post);
