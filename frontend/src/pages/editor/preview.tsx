import React from "react";
import { CircularProgress, withStyles, WithStyles } from "@material-ui/core";
import { Preview as Style } from "../../styles/editor";
import url_for from "../../utils/url_for";

interface PreviewProps extends WithStyles<typeof Style> {
  heading: string;
  content: string;
  show: boolean;
}

class Preview extends React.Component<PreviewProps> {
  state = {
    isLoaded: false,
    content: "",
    error: "",
  };
  componentDidMount() {
    if (this.props.show) {
      let text = (document.getElementById(
        this.props.content
      ) as HTMLTextAreaElement).value;
      let heading = (document.getElementById(
        this.props.heading
      ) as HTMLInputElement).value;

      if (heading.length > 100 || text.length > 40960)
        this.setState({
          isLoaded: true,
          error:
            "Your content or heading is too long to be submitted.\nPlease make it shorter.",
        });
      else if (text === "" || heading === "")
        this.setState({
          isLoaded: true,
          error:
            "You have to give your article a heading and some content before you can preview it.",
        });
      else {
        fetch(url_for("api.renderer"), {
          method: "POST",
          body: JSON.stringify({ heading, content: text }),
        })
          .then((res) => {
            res.text().then((content) => {
              if (res.ok)
                this.setState({
                  isLoaded: true,
                  content,
                });
              else
                this.setState({
                  isLoaded: true,
                  error: `Sorry, we couldn't load this content.\nPlease try again.\nServer responded with text: "${content}". Request Status: ${res.status}`,
                });
            });
          })
          .catch((err) => {
            this.setState({
              isLoaded: true,
              error: `Sorry, we couldn't load this content.\nPlease try again. Got error ${err}`,
            });
          });
      }
    }
  }
  render() {
    const { classes } = this.props;
    // Got an error
    if (this.state.error)
      return <div className={classes.error}>{this.state.error}</div>;
    // Content to show
    else if (this.props.show)
      return (
        <div className={classes.root}>
          {this.state.isLoaded ? (
            <div dangerouslySetInnerHTML={{ __html: this.state.content }} />
          ) : (
            <div className={classes.loading}>
              Loading <br />
              <CircularProgress />
            </div>
          )}
        </div>
      );
    // Nothing to show
    else return null;
  }
}

export default withStyles(Style)(Preview);
