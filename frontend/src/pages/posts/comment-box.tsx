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
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Send, Chat } from "@material-ui/icons";
import { Link } from "react-router-dom";
import url_for from "../../utils/url_for";
import { CommentBox as Styles } from "../../styles/post";
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

interface CommentProps extends WithStyles<typeof Styles> {
  uuid: string;
}

class _Comment extends React.Component<CommentProps> {
  state: {
    loaded: boolean;
    author: {
      username: string;
      avatar: string;
    } | null;
    content: string | null;
  };
  constructor(props: CommentProps) {
    super(props);
    this.state = {
      loaded: false,
      author: null,
      content: null,
    };
  }
  render() {
    if (this.state.loaded) return <div>Loaded</div>;
    return <Skeleton variant="circle" />;
  }
}

class _CommentBox extends React.Component<CommentBoxProps> {
  state: {
    comments: string[];
    loaded: boolean;
    more_available: boolean;
    error: string;
  };
  constructor(props: CommentBoxProps) {
    super(props);
    this.state = {
      comments: [],
      loaded: false,
      more_available: false,
      error: "",
    };
  }
  componentDidMount() {
    fetch(
      url_for("api.posts.get_comments") +
        `?uuid=${this.props.uuid}&from=0&to=10`
    ).then((res) => {
      if (!res.ok) {
        res.text().then((txt) => {
          this.setState({
            error: `Failed to load comments. The server responded with: "${txt}". ${res.status} ${res.statusText}`,
          });
        });
      } else {
        return res.json().then((comments) => {
          this.setState({ comments, loaded: true });
        });
      }
    });
  }
  render() {
    const { classes } = this.props;
    return (
      <Dialog
        className={classes.root}
        open={this.props.show}
        onClose={this.props.onClose}
      >
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
            (this.state.more_available ? (
              <Button size="small">Load More</Button>
            ) : (
              <i>No more comments</i>
            ))}
        </DialogContent>
        <DialogActions className={this.props.context.username !== "" ?classes.actions : classes.no_user}>
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
            <div>
              <TextField label="Add a Comment..." />
              <IconButton>
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
const Comment = withStyles(Styles)(_Comment);

export default CommentButton;
