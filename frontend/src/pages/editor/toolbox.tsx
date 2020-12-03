import React from "react";
import {
  ButtonGroup,
  Button,
  Card,
  withStyles,
  WithStyles,
  Tooltip,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  DragIndicator,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatListBulleted,
  FormatQuote,
  FormatSize,
  Image,
  InsertLink,
  Code,
  Highlight,
} from "@material-ui/icons";
import { ToolBox as Styles } from "../../styles/editor";

interface ToolBoxProps extends WithStyles<typeof Styles> {
  textarea: string;
}

class Toolbox extends React.Component<ToolBoxProps> {
  state: {
    anchorEl_heading: null | HTMLElement;
  };
  constructor(props: ToolBoxProps) {
    super(props);
    this.state = {
      anchorEl_heading: null,
    };
    this.md_handler = this.md_handler.bind(this);
    this.menuOpen_heading = this.menuOpen_heading.bind(this);
    this.menuClose_heading = this.menuClose_heading.bind(this);
  }

  md_handler(start_char: string, end_char: string): () => void {
    return () => {
      let textarea = document.getElementById(
        this.props.textarea
      ) as HTMLTextAreaElement;
      let start = textarea.selectionStart,
        end = textarea.selectionEnd;
      if (start && end) {
        textarea.value =
          textarea.value.substring(0, start) +
          start_char +
          textarea.value.substring(start, end) +
          end_char +
          textarea.value.substring(end);
        textarea.focus();
        textarea.selectionEnd = end + start_char.length;
      } else {
        let len = textarea.value.length;
        textarea.value = textarea.value + start_char + end_char;
        textarea.focus();
        textarea.selectionEnd = len + start_char.length;
      }
    };
  }
  menuOpen_heading(ev: React.MouseEvent<HTMLElement>) {
    this.setState({ anchorEl_heading: ev.currentTarget });
  }
  menuClose_heading() {
    this.setState({ anchorEl_heading: null });
  }
  componentDidMount() {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    document.getElementById(
      "toolbox-draggable-header"
    )!.onmousedown = dragMouseDown;

    function dragMouseDown(e: MouseEvent) {
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
      e.preventDefault();
      let elmnt = document.getElementById("toolbox")!;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.root} id="toolbox">
        <ButtonGroup variant="text">
          <Tooltip title="Move the toolbox" arial-label="Move the toolbox">
            <Button id="toolbox-draggable-header" className={classes.dragger}>
              <DragIndicator />
            </Button>
          </Tooltip>
          <Tooltip title="Bold" arial-label="Bold">
            <Button onClick={this.md_handler("**", "**")}>
              <FormatBold />
            </Button>
          </Tooltip>
          <Tooltip title="Italics" arial-label="Italics">
            <Button onClick={this.md_handler("_", "_")}>
              <FormatItalic />
            </Button>
          </Tooltip>
          <Tooltip title="Link" arial-label="Link">
            <Button
              onClick={this.md_handler(
                "[Link text here](",
                "The actual url goes here)"
              )}
            >
              <InsertLink />
            </Button>
          </Tooltip>
          <Tooltip title="Strikethrough" arial-label="Strikethrough">
            <Button onClick={this.md_handler("~", "~")}>
              <FormatStrikethrough />
            </Button>
          </Tooltip>
          <Tooltip title="Code" arial-label="Code">
            <Button onClick={this.md_handler("\n```\n", "\n```\n")}>
              <Code />
            </Button>
          </Tooltip>
          <Tooltip title="Highlight" arial-label="Highlight">
            <Button onClick={this.md_handler("->", "<-")}>
              <Highlight />
            </Button>
          </Tooltip>
          <Tooltip title="Headings" arial-label="Headings">
            <Button
              aria-haspopup="true"
              aria-controls="toolbox-heading-menu"
              onClick={this.menuOpen_heading}
            >
              <FormatSize />
            </Button>
          </Tooltip>
          <Tooltip title="Quote" arial-label="Quote">
            <Button onClick={this.md_handler(">", "")}>
              <FormatQuote />
            </Button>
          </Tooltip>
          <Tooltip title="List" arial-label="List">
            <Button onClick={this.md_handler("- ", "\n")}>
              <FormatListBulleted />
            </Button>
          </Tooltip>
          <Tooltip title="Add an image" arial-label="Add an image">
            <Button
              aria-haspopup="true"
              aria-controls="toolbox-image-menu"
              onClick={this.md_handler(
                "![Image Caption]",
                "(yourwebsite/path/to/image.png)"
              )}
            >
              <Image />
            </Button>
          </Tooltip>
        </ButtonGroup>
        <Menu
          anchorEl={this.state.anchorEl_heading}
          onClose={this.menuClose_heading}
          open={this.state.anchorEl_heading !== null}
          id="toolbox-heading-menu"
        >
          <MenuItem
            onClick={() => {
              this.md_handler("\n\n# Heading goes here", "\n")();
              this.menuClose_heading();
            }}
          >
            Heading 1 (Largest)
          </MenuItem>
          {Array.from({ length: 4 }, (_obj, index) => (
            <MenuItem
              onClick={() => {
                this.md_handler(
                  `\n\n${"#".repeat(index + 2)} Heading goes here`,
                  "\n"
                )();
                this.menuClose_heading();
              }}
            >
              Heading {index + 2}
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              this.md_handler("\n\n###### Heading goes here", "\n")();
              this.menuClose_heading();
            }}
          >
            Heading 6 (Smallest)
          </MenuItem>
        </Menu>
      </Card>
    );
  }
}

export default withStyles(Styles)(Toolbox);
