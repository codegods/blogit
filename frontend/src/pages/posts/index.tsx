import React from "react";
import {
  withStyles,
  WithStyles,
  Grid,
  Button,
  Tooltip,
} from "@material-ui/core";
import { Favorite, FavoriteBorder, Share } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { RouteComponentProps, Link } from "react-router-dom";
import { RootStyles as Styles } from "../../styles/post";
import Comments from "./comment-box";
import url_for from "../../utils/url_for";

type Props = RouteComponentProps<{
  postid: string;
}> &
  WithStyles<typeof Styles>;

class Post extends React.Component<Props> {
  state: {
    post: {
      title: string;
      content: string;
      datetime: string;
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
      post: null,
      author: null,
      stats: null,
      liked_by_user: false,
    };
    this.load_author = this.load_author.bind(this);
    this.load_post = this.load_post.bind(this);
    this.load_stats = this.load_stats.bind(this);
    this.hasUserLiked = this.hasUserLiked.bind(this);
  }
  load_post() {
    fetch(url_for("api.posts.get") + "?uuid=" + this.props.match.params.postid)
      .then((res) => {
        if (res.ok)
          res.json().then((json) => {
            this.setState({ post: json });
            document.title = `${json.title} - Blogit`;
            this.load_stats();
          });
        else
          throw Error(
            `Server gave an invalid response code: ${res.status}. Reponse String: ${res.statusText}`
          );
      })
      .catch((err) => {});
  }
  load_stats() {
    fetch(
      url_for("api.posts.stats") + "?uuid=" + this.props.match.params.postid
    )
      .then((res) => {
        if (res.ok) return res.json();
        else
          throw Error(
            `Server gave an invalid response code: ${res.status}. Reponse String: ${res.statusText}`
          );
      })
      .catch((err) => {})
      .then((json) => {
        this.setState({ stats: json });
        this.load_author();
      });
  }
  load_author() {
    fetch(
      url_for("api.posts.author") + "?uuid=" + this.props.match.params.postid
    )
      .then((res) => {
        if (res.ok) return res.json();
        else
          throw Error(
            `Server gave an invalid response code: ${res.status}. Reponse String: ${res.statusText}`
          );
      })
      .catch((err) => {})
      .then((json) => {
        this.setState({
          author: {
            name: json.name,
            username: json.username,
            avatar: "",
          },
        });
        this.hasUserLiked();
        // Preload the avatar image
        let img = new Image();
        let src =
          url_for("api.storage.avatar") +
          "?user=" +
          json.username +
          "&size=" +
          128;
        img.src = src;
        img.onload = () => {
          this.setState({
            author: {
              name: json.name,
              username: json.username,
              avatar: src,
            },
          });
        };
      });
  }
  hasUserLiked() {
    fetch(
      url_for("api.posts.liked_by_user") +
        "?uuid=" +
        this.props.match.params.postid
    )
      .then((res) => {
        if (res.ok) return res.text();
        else
          throw Error(
            `Server gave an invalid response code: ${res.status}. Reponse String: ${res.statusText}`
          );
      })
      .catch((err) => {})
      .then((res) => {
        this.setState({ liked_by_user: res === "true" });
      });
  }
  componentDidMount() {
    this.load_post();
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.state.post ? (
          <h1>{this.state.post.title}</h1>
        ) : (
          <Skeleton animation="wave" width="90vw">
            <h1>Loading...</h1>
          </Skeleton>
        )}
        <Grid container className={classes.author}>
          <Grid item xs={5} sm={3}>
            {this.state.author && this.state.author.avatar !== "" ? (
              <img
                src={this.state.author.avatar}
                className={classes.avatar}
                alt={`${this.state.author.username}'s profile avatar`}
              />
            ) : (
              <Skeleton
                animation="wave"
                width="3em"
                height="3em"
                variant="circle"
              />
            )}
          </Grid>
          <Grid item xs={7} sm={9}>
            {this.state.author ? (
              <Link
                className={classes.uname}
                to={url_for("views.user").replace(
                  /:username$/,
                  this.state.author.username
                )}
              >
                {this.state.author.username +
                  "  (" +
                  this.state.author.name +
                  ")"}
              </Link>
            ) : (
              <Skeleton animation="wave" height="1.3em" width="30vw" />
            )}
            <br />
            {this.state.post ? (
              <span>{this.state.post.datetime}</span>
            ) : (
              <Skeleton animation="wave" height="1.3em" width="15vw" />
            )}
          </Grid>
        </Grid>

        {this.state.post ? (
          <div
            dangerouslySetInnerHTML={{ __html: this.state.post.content }}
            className={classes.post}
          />
        ) : (
          <div>
            <Skeleton animation="wave" width="90%" />
            <Skeleton animation="wave" width="90%" />
          </div>
        )}

        <div className={classes.actions}>
          <Tooltip
            title={this.state.liked_by_user ? "You've liked this post" : "Like"}
          >
            <span>
              <Button
                className={classes.actionButton}
                onClick={() => {
                  this.state.stats &&
                    fetch(
                      url_for("api.posts.like") +
                        "?uuid=" +
                        this.props.match.params.postid
                    ).then((res) => {
                      if (res.ok) {
                        let stats = this.state.stats;
                        stats!.likes += 1;
                        this.setState({
                          stats,
                          liked_by_user: true,
                        });
                      } else {
                        switch (res.status) {
                          case 400:
                            alert("You've already liked this post");
                            break;
                          case 403:
                            alert("Please login to like.");
                            break;
                          default:
                            alert(
                              `Failed to like because: ${res.status} ${res.statusText}`
                            );
                            break;
                        }
                      }
                    });
                }}
              >
                <span className={classes.actionsWrapper}>
                  {this.state.liked_by_user ? <Favorite /> : <FavoriteBorder />}
                  <span>
                    {this.state.stats ? this.state.stats.likes : "Loa"}
                  </span>
                </span>
              </Button>
            </span>
          </Tooltip>
          <Comments
            classes={{
              actionWrapper: classes.actionsWrapper,
              actionButton: classes.actionButton,
            }}
            comments={this.state.stats && this.state.stats.comments}
            uuid={this.props.match.params.postid}
          />
          <Tooltip title="Share">
            <span>
              <Button
                className={classes.actionButton}
                onClick={() => {
                  new Promise((res, rej) => {
                    if (navigator.share)
                      navigator
                        .share({
                          url: window.location.href,
                          text: "Read this amazing post on blogit now!!",
                          title: this.state.post ? this.state.post.title : "",
                        })
                        .then(() => res());
                    else {
                      navigator.clipboard
                        .writeText(
                          `${
                            this.state.post ? this.state.post.title : ""
                          }\nRead this amazing post on blogit now!!\n${
                            window.location.href
                          }`
                        )
                        .then(() => {
                          alert(
                            "Your device doesn't seem to support sharing.\nSo, we copied it to your clipboard!"
                          );
                          res();
                        });
                    }
                  }).then(() => {
                    fetch(
                      url_for("api.posts.share") +
                        `?uuid=${this.props.match.params.postid}`
                    ).then((res) => {
                      let stats = this.state.stats;
                      stats!.shares += 1;
                      this.setState({ stats });
                    });
                  });
                }}
              >
                <span className={classes.actionsWrapper}>
                  <Share />
                  <span>
                    {this.state.stats ? this.state.stats.shares : "g..."}
                  </span>
                </span>
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }
}

export default withStyles(Styles)(Post);
