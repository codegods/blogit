import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  withStyles,
  WithStyles,
  CardActions,
  Avatar,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { FavoriteBorder, Chat, Share } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { PostStyles } from "../styles/explore";
import url_for from "../utils/url_for";

interface PostProps extends WithStyles<typeof PostStyles> {
  uuid: string;
}

class Post extends React.Component<PostProps> {
  state: {
    content: {
      stats: {
        likes: number;
        shares: number;
        comments: number;
      };
      title: string;
      author: {
        avatar: string;
        name: string;
      };
    } | null;
  };
  constructor(props: PostProps) {
    super(props);
    this.state = {
      content: null,
    };
  }
  componentDidMount() {
    fetch(url_for("api.posts.explore.info") + "?uuid=" + this.props.uuid).then(
      (res) => {
        if (res.ok) {
          res.json().then((json) => {
            this.setState({
              content: {
                stats: {
                  ...json.stats,
                },
                title: json.title,
                author: {
                  avatar: "",
                  name: json.author.name,
                },
              },
            });
            let img = new Image();
            let src =
              url_for("api.storage.avatar") +
              "?user=" +
              json.author.name +
              "&size=" +
              128;
            img.src = src;
            img.onload = () => {
              let prev_state = this.state.content;
              prev_state!.author.avatar = src;
              this.setState({
                content: prev_state,
              });
            };
          });
        } else {
          this.setState({
            content: {
              author: {
                name: "Failed to load",
                avatar: "",
              },
              title: `We couldn't load the content. Error: ${res.status} ${res.statusText}`,
              stats: {
                likes: 0,
                comments: 0,
                shares: 0,
              },
            },
          });
        }
      }
    );
  }
  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.root} elevation={4} variant="outlined">
        <CardHeader
          title={
            this.state.content ? (
              <Link
                to={url_for("views.posts").replace(
                  /:[a-z]+/,
                  this.state.content.author.name
                )}
                className={classes.link}
              >
                {this.state.content.author.name}
              </Link>
            ) : (
              <Skeleton />
            )
          }
          avatar={
            this.state.content && this.state.content.author.avatar !== "" ? (
              <Avatar src={this.state.content.author.avatar}>
                {this.state.content && this.state.content.author.name.charAt(0)}
              </Avatar>
            ) : (
              <Skeleton variant="circle" />
            )
          }
        />
        {this.state.content ? (
          <CardContent style={{ fontSize: "large" }}>
            <Link
              to={url_for("views.posts").replace(/:[a-z]+/, this.props.uuid)}
              className={classes.link}
            >
              {this.state.content.title}
            </Link>
          </CardContent>
        ) : (
          <CardContent>
            <Skeleton />
            <Skeleton />
          </CardContent>
        )}
        <CardActions>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <FavoriteBorder />
              <span>
                {this.state.content ? this.state.content.stats.likes : "Loa"}
              </span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Chat />
              <span>
                {this.state.content ? this.state.content.stats.comments : "din"}
              </span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Share />
              <span>
                {this.state.content ? this.state.content.stats.shares : "g..."}
              </span>
            </span>
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(PostStyles)(Post);
