import React from "react";
import {
  Button,
  TextField,
  Container,
  WithStyles,
  LinearProgress,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { CloudUpload } from "@material-ui/icons";
import { signup as Styles } from "../../styles/auth";

interface SignUpState {
  step: number;
  isLoading: boolean;
}

interface SignUpPage extends React.Component {
  steps: Array<React.ReactNode>;
  nextStep: (_e: React.ChangeEvent<{}>) => void;
}

type PropTypes = WithStyles<typeof Styles>;

class SignUp extends React.Component<PropTypes> implements SignUpPage {
  state: SignUpState;
  steps: SignUpPage["steps"];
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      step: 0,
      isLoading: false,
    };
    this.nextStep = this.nextStep.bind(this);
    this.steps = [
      // Step 0: Email and Password
      <div>
            <TextField
              margin="normal"
              variant="outlined"
              required
              fullWidth
              id="auth-signup-email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
            <TextField
              margin="normal"
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="auth-signup-password"
              autoComplete="current-password"
            />
      </div>,
      // Step 1: Pick a Username, First and Last name
      <div>
          <TextField
              margin="normal"
            autoComplete="fname"
            name="firstName"
            variant="outlined"
            required
            fullWidth
            id="auth-signup-firstName"
            label="First Name"
            autoFocus
          />
          <TextField
              margin="normal"
            variant="outlined"
            required
            fullWidth
            id="auth-signup-lastName"
            label="Last Name"
            name="lastName"
            autoComplete="lname"
          />
          <TextField
              margin="normal"
            variant="outlined"
            required
            fullWidth
            id="auth-signup-username"
            label="Pick a user name"
            name="userName"
            autoComplete="uname"
          />
      </div>,
      // Step 2: Bio data and avatar
      <div>
          <input
            type="file"
            id="auth-signup-file-uploader"
            className={this.props.classes.hidden}
          />
          <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
            Choose an Avatar
          </Button>
          <TextField
              margin="normal"
            variant="outlined"
            fullWidth
            id="auth-signup-biodata"
            label="Add something about yourself"
            name="bioData"
            multiline
          />
      </div>,
    ];
  }
  nextStep(_e: React.ChangeEvent<{}>) {
    if (this.state.step < this.steps.length) {
      this.setState({
        step: this.state.step + 1,
      });
    }
  }
  render() {
    const { classes } = this.props;

    return (
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <form className={classes.form} noValidate>
            {
              // Display the current step
              this.steps[this.state.step]
            }
          </form>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={this.nextStep}
          >
            Next
          </Button>
        </div>
        <LinearProgress
          className={classes.progress}
          variant={this.state.isLoading ? "indeterminate" : "determinate"}
          value={(this.state.step / this.steps.length) * 100}
        />
      </Container>
    );
  }
}

export default withStyles(Styles)(SignUp);
