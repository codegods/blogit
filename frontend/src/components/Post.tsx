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
import { FavoriteBorder, Chat, Share } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { PostStyles } from "../styles/explore";
import url_for from "../utils/url_for";

interface PostProps extends WithStyles<typeof PostStyles> {
  content: {
    id: string;
    likes: number;
    shares: number;
    comments: number;
    title: string;
    name: string;
  };
}

class Post extends React.Component<PostProps> {
  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.root} elevation={4} variant="outlined">
        <CardHeader
          title={
            <Link
              to={url_for("views.user").replace(
                /:[a-z]+/,
                this.props.content.name
              )}
              className={classes.link}
            >
              {this.props.content.name}
            </Link>
          }
          avatar={
            <Avatar
              src={`${url_for("api.storage.avatar")}?user=${
                this.props.content.name
              }&size=128`}
            >
              {this.props.content.name.charAt(0)}
            </Avatar>
          }
        />
        <CardContent style={{ fontSize: "large" }}>
          <Link
            to={url_for("views.posts").replace(
              /:[a-z]+/,
              this.props.content.id
            )}
            className={classes.link}
          >
            {this.props.content.title}
          </Link>
        </CardContent>
        <CardActions>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <FavoriteBorder />
              <span>{this.props.content.likes}</span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Chat />
              <span>{this.props.content.comments}</span>
            </span>
          </Button>
          <Button className={classes.actionButton}>
            <span className={classes.actionsWrapper}>
              <Share />
              <span>{this.props.content.shares}</span>
            </span>
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(PostStyles)(Post);
