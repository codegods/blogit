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
    console.log("Reloading...")
    if(this.props.show){
      fetch(url_for("api.renderer"), {
        method: "POST",
        body: `# ${
          (document.getElementById(this.props.heading) as HTMLInputElement).value
        }\n\n${
          (document.getElementById(this.props.content) as HTMLTextAreaElement)
            .value
        }`,
      }).then((res) => {
        console.log(res)
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
      });
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
            <div>
              Loading
              <CircularProgress />
            </div>
          )}
        </div>
      );
    else return null;
  }
}

export default withStyles(Style)(Preview);
