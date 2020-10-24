import React from "react";
import {
  Button,
  TextField,
  Container,
  WithStyles,
  LinearProgress,
  Grid,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { CloudUpload } from "@material-ui/icons";
import { signup as Styles } from "../../styles/auth";

// State of the signup page
interface SignUpState {
  step: number;
  isLoading: boolean;
}

// The Signup Component
interface SignUpPage extends React.Component {
  steps: Array<React.ReactNode>;
  nextStep: (_e: React.ChangeEvent<{}>) => void;
  prevStep: (_e: React.ChangeEvent<{}>) => void;
  _ids: {
    [index: string]: {
      id: string;
      onClick?: (evt: React.ChangeEvent<HTMLElement>) => void;
      onChange?: (evt: React.ChangeEvent<HTMLElement>) => void;
    };
  };
}

// Props it will accept
type PropTypes = WithStyles<typeof Styles>;

class SignUp extends React.Component<PropTypes> implements SignUpPage {
  state: SignUpState;
  steps: SignUpPage["steps"];
  _ids: SignUpPage["_ids"];
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      step: 0,
      isLoading: false,
    };
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);

    this._ids = {
      email: {
        id: "auth-signup-email",
      },
      password: {
        id: "auth-signup-password",
      },
      username: {
        id: "auth-signup-username",
      },
      fname: {
        id: "auth-signup-fname",
      },
      lname: {
        id: "auth-signup-lname",
      },
      proxyPicker: {
        id: "auth-signup-proxy-avatar",
      },
      avatar: {
        id: "auth-signup-avatar",
      },
      bio: {
        id: "auth-signup-bio",
      },
    };

    // The steps user will go through
    this.steps = [
      // Step 0: Email and Password
      <div>
        <TextField
          margin="normal"
          variant="outlined"
          required
          fullWidth
          id={this._ids.email.id}
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
          id={this._ids.password.id}
          autoComplete="current-password"
        />
        <TextField
          margin="normal"
          variant="outlined"
          required
          fullWidth
          name="password-confirm"
          label="Confirm Password"
          type="password"
          id="auth-signup-password-confirm"
          autoComplete="current-password-confirm"
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
          id={this._ids.fname.id}
          label="First Name"
          autoFocus
        />
        <TextField
          margin="normal"
          variant="outlined"
          required
          fullWidth
          id={this._ids.lname.id}
          label="Last Name"
          name="lastName"
          autoComplete="lname"
        />
        <TextField
          margin="normal"
          variant="outlined"
          required
          fullWidth
          id={this._ids.username.id}
          label="Pick a user name"
          name="userName"
          autoComplete="uname"
        />
      </div>,
      // Step 2: Bio data and avatar
      <div>
        <input
          type="file"
          id={this._ids.proxyPicker.id}
          className={this.props.classes.hidden}
        />
        <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
          Choose an Avatar
        </Button>
        <TextField
          margin="normal"
          variant="outlined"
          fullWidth
          id={this._ids.bio.id}
          label="Add something about yourself"
          name="bioData"
          multiline
        />
      </div>,
    ];
  }

  nextStep(_e: React.ChangeEvent<{}>) {
    if (this.state.step < this.steps.length - 1) {
      this.setState({
        step: this.state.step + 1,
      });
    }
  }

  prevStep(_e: React.ChangeEvent<{}>) {
    if (this.state.step > 0) {
      this.setState({
        step: this.state.step - 1,
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
          <Grid container xs={12} sm={12}>
            <Grid sm={6} xs={12} style={{textAlign: "center"}}>
              <Button
                variant="contained"
                color="secondary"
                className={classes.submit}
                disabled={this.state.step === 0}
                onClick={this.prevStep}
              >
                Prev
              </Button>
            </Grid>
            <Grid sm={6} xs={12} style={{textAlign: "center"}}>
              <Button
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={this.nextStep}
              >
                Next
              </Button>
            </Grid>
          </Grid>
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
