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
  state: {
    isLoaded: boolean;
    content: string;
  };
  constructor(props: PreviewProps) {
    super(props);
    this.state = {
      isLoaded: false,
      content: "",
    };
  }

  componentDidMount() {
    if (this.props.show) {
      let text = (document.getElementById(
        this.props.content
      ) as HTMLTextAreaElement).value;
      let heading = (document.getElementById(
        this.props.heading
      ) as HTMLInputElement).value;

      if (text === "" || heading === "") {
        this.setState({
          isLoaded: true,
          content: `
            <div style="color:red">
            You have to give your article a heading and some content before you can preview it.
            </div>
          `,
        });
      } else {
        fetch(url_for("api.renderer"), {
          method: "POST",
          body: `# ${heading}\n\n${text}`,
        }).then((res) => {
          if (!res.ok) {
            this.setState({
              isLoaded: true,
              content: `<h5 style="color: red">Sorry, we couldn't load this content. Please try again.</h5>`,
            });
          } else {
            res.text().then((content) =>
              this.setState({
                isLoaded: true,
                content,
              })
            );
          }
        }).catch(err => {
          this.setState({
            isLoaded: true,
            content: `<h5 style="color: red">Sorry, we couldn't load this content. Please try again. Got error ${err}</h5>`,
          });
        });
      }
    }
  }
  render() {
    const { classes } = this.props;
    if (this.props.show)
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
    else return null;
  }
}

export default withStyles(Style)(Preview);
