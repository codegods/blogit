import React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  withStyles,
  WithStyles,
  TextField,
  Button,
  Tooltip,
  IconButton,
  Grid,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Send, Chat } from "@material-ui/icons";
import { Link } from "react-router-dom";
import url_for from "../../utils/url_for";
import { CommentBox as Styles, Comment as CStyles } from "../../styles/post";
import { UserContextType, withUserContext } from "../../utils/UserContext";

type CommentBoxProps = WithStyles<typeof Styles> & {
  context: UserContextType;
  show: boolean;
  uuid: string;
  onClose: () => void;
};

type CommentButtonProps = {
  classes: {
    actionButton: string;
    actionWrapper: string;
  };
  comments: null | number;
  uuid: string;
};

interface CommentProps extends WithStyles<typeof CStyles> {
  uuid: string;
}

class _Comment extends React.Component<CommentProps> {
  state: {
    author: {
      username: string;
      avatar: string;
    } | null;
    content: string | null;
  };
  constructor(props: CommentProps) {
    super(props);
    this.state = {
      author: null,
      content: null,
    };
  }
  componentDidMount() {
    fetch(
      url_for("api.posts.get_comment_by_id") + "?uuid=" + this.props.uuid
    ).then((res) => {
      if (res.ok) {
        res.json().then((cmt) => {
          this.setState({
            content: cmt.content,
            author: {
              username: cmt.username,
              avatar: "",
            },
          });
          let img = new Image();
          let src =
            url_for("api.storage.avatar") +
            "?user=" +
            cmt.username +
            "&size=" +
            128;
          img.src = src;
          img.onload = () => {
            this.setState({
              author: {
                username: cmt.username,
                avatar: src,
              },
            });
          };
        });
      }
    });
  }
  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container className={classes.root}>
          <Grid item xs={3}>
            {this.state.author ? (
              <img className={classes.img} src={this.state.author.avatar} alt={this.state.author.username + "'s avatar"} />
            ) : (
              <Skeleton variant="circle" width="3em" height="3em" />
            )}
          </Grid>
          <Grid item xs={9}>
            {this.state.author ? (
              <Link className={classes.uname} to={url_for("views.user").replace(/:[a-z]+/, this.state.author.username)}>{this.state.author.username}</Link>
            ) : (
              <Skeleton width="50%" />
            )}
            {this.state.content ? (
              <div>{this.state.content}</div>
            ) : (
              <Skeleton width="100%" />
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

class _CommentBox extends React.Component<CommentBoxProps> {
  state: {
    comments: string[];
    loaded: boolean;
    error: string;
  };
  constructor(props: CommentBoxProps) {
    super(props);
    this.state = {
      comments: [],
      loaded: false,
      error: "",
    };
    this.postComment = this.postComment.bind(this);
  }
  componentDidMount() {
    fetch(
      url_for("api.posts.get_comments") + `?uuid=${this.props.uuid}&from=0`
    ).then((res) => {
      if (!res.ok) {
        res.text().then((txt) => {
          this.setState({
            error: `Failed to load comments. The server responded with: "${txt}". ${res.status} ${res.statusText}`,
          });
        });
      } else {
        res.json().then((comments) => {
          this.setState({ comments: comments.comments, loaded: true });
        });
      }
    });
  }
  postComment(){
    let comment =  (document.getElementById("comment-box-create") as HTMLInputElement).value;
    if (comment)
      fetch(url_for("api.posts.comment"), {
        method: "POST",
        body: JSON.stringify({
          uuid: this.props.uuid,
          comment
        })
      }).then(res => {
        if (res.ok)
          res.text().then(txt => {
            this.setState({ comments: this.state.comments.concat(txt)});
            (document.getElementById("comment-box-create") as HTMLInputElement).value = "";
          })
        else
          alert(`Could not post comment. Error: ${res.status} ${res.statusText}`)
      })
    else
      alert("Please enter something to post it!")
  }
  render() {
    const { classes } = this.props;
    return (
      <Dialog open={this.props.show} onClose={this.props.onClose}>
        <DialogTitle className={classes.title}>Comments</DialogTitle>
        <DialogContent>
          {this.state.loaded ? (
            this.state.comments.map((uid, key) => (
              <Comment uuid={uid} key={key} />
            ))
          ) : (
            <Skeleton />
          )}
          {this.state.loaded &&
            (this.state.comments.length ? (
              this.state.comments.length % 10 === 0 ? (
                <Button size="small" variant="contained">
                  Load More
                </Button>
              ) : (
                <i>No more comments</i>
              )
            ) : (
              <i>Be the first one to add a comment</i>
            ))}
        </DialogContent>
        <DialogActions
          className={
            this.props.context.username !== ""
              ? classes.actions
              : classes.no_user
          }
        >
          {this.props.context.username === "" ? (
            <div>
              <Link
                to={
                  url_for("views.auth.login") +
                  "?next=" +
                  encodeURIComponent(window.location.pathname)
                }
              >
                Login
              </Link>{" "}
              or{" "}
              <Link
                to={
                  url_for("views.auth.signup") +
                  "?next=" +
                  encodeURIComponent(window.location.pathname)
                }
              >
                Signup
              </Link>{" "}
              to post a comment
            </div>
          ) : (
            <div className={classes.action}>
              <TextField
                className={classes.textfield}
                label="Add a Comment..."
                id="comment-box-create"
              />
              <IconButton onClick={() => this.postComment()}>
                <Send />
              </IconButton>
            </div>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

class CommentButton extends React.Component<CommentButtonProps> {
  state = {
    show_comment_box: false,
  };
  render() {
    const { classes } = this.props;
    return (
      <span>
        <Tooltip title="Comments">
          <Button
            className={classes.actionButton}
            onClick={() => this.setState({ show_comment_box: true })}
          >
            <span className={classes.actionWrapper}>
              <Chat />
              <span>
                {this.props.comments !== null ? this.props.comments : "din"}
              </span>
            </span>
          </Button>
        </Tooltip>
        <CommentBox
          show={this.state.show_comment_box}
          uuid={this.props.uuid}
          onClose={() => this.setState({ show_comment_box: false })}
        />
      </span>
    );
  }
}

const CommentBox = withStyles(Styles)(withUserContext(_CommentBox));
const Comment = withStyles(CStyles)(_Comment);

export default CommentButton;
