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
import Validator from "./Validator";

// Props it will accept
type PropTypes = WithStyles<typeof Styles>;

class SignUp extends React.Component<PropTypes> {
  state: {
    step: number;
    isLoading: boolean;
    error_id: string | null;
    errorText: string;
  };
  uuid: string;
  _ids: {
    [index: string]: string;
  };

  constructor(props: PropTypes) {
    super(props);
    this.state = {
      step: 0,
      isLoading: false,
      error_id: "",
      errorText: "",
    };
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);

    // HTML IDs for the app
    this._ids = {
      email: "auth-signup-email",
      password: "auth-signup-password",
      password_confirm: "auth-signup-password-confirm",
      username: "auth-signup-username",
      fname: "auth-signup-fname",
      lname: "auth-signup-lname",
      proxyPicker: "auth-signup-proxy-avatar",
      avatar: "auth-signup-avatar",
      bio: "auth-signup-bio",
    };
    this.uuid = "";
  }

  nextStep(_e: React.ChangeEvent<{}>) {
    let go_to_next = () => {
      // 3 steps are possible: 0, 1, 2
      if (this.state.step < 2) {
        this.setState({
          step: this.state.step + 1,
          isLoading: false,
          error: null,
        });
      }
    };

    this.setState({
      isLoading: true,
    });
    switch (this.state.step) {
      case 0:
        Validator.validate_step_1(
          this._ids.email,
          this._ids.password,
          this._ids.password_confirm
        ).then((res) => {
          if (res.error) {
            this.setState({
              error_id: res.error.id,
              errorText: res.error.message,
              isLoading: false,
            });
          } else {
            this.uuid = res.uuid || "";
            go_to_next();
          }
        });
        break;
      case 1:
        Validator.validate_step_2(
          this.uuid,
          this._ids.username,
          this._ids.fname,
          this._ids.lname
        ).then((res) => {
          if (res.error) {
            this.setState({
              error_id: res.error.id,
              errorText: res.error.message,
              isLoading: false,
            });
          } else {
            go_to_next();
          }
        });
        break;
      case 2:
        Validator.validate_step_3(
          this.uuid,
          this._ids.proxyPicker,
          this._ids.bio
        ).then((res) => {
          if (res.error) {
            this.setState({
              error_id: res.error.id,
              errorText: res.error.message,
              isLoading: false,
            });
          } else {
            window.location.assign("/")
            go_to_next();
          }
        });
        break;
    }
  }

  prevStep(_e: React.ChangeEvent<{}>) {
    if (this.state.step > 0) {
      this.setState({
        step: this.state.step - 1,
        error: null
      });
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <form className={classes.form} noValidate>
            <div
              style={{
                display: this.state.step === 0 ? "block" : "none",
              }}
            >
              <TextField
                margin="normal"
                variant="outlined"
                required
                fullWidth
                error={this.state.error_id === this._ids.email}
                helperText={
                  this.state.error_id === this._ids.email
                    ? this.state.errorText
                    : ""
                }
                id={this._ids.email}
                label="Email Address"
                name="email"
                autoComplete="email"
                placeholder="Enter your email..."
                autoFocus
              />
              <TextField
                margin="normal"
                variant="outlined"
                placeholder="Enter your password..."
                required
                fullWidth
                error={this.state.error_id === this._ids.password}
                helperText={
                  this.state.error_id === this._ids.password
                    ? this.state.errorText
                    : ""
                }
                name="password"
                label="Password"
                type="password"
                id={this._ids.password}
              />

              <TextField
                margin="normal"
                variant="outlined"
                required
                fullWidth
                name="password-confirm"
                label="Confirm Password"
                type="password"
                id={this._ids.password_confirm}
                error={this.state.error_id === this._ids.password_confirm}
                helperText={
                  this.state.error_id === this._ids.password_confirm
                    ? this.state.errorText
                    : ""
                }
              />
            </div>
            {/* Step 1: Pick a Username, First and Last name*/}
            <div
              style={{
                display: this.state.step === 1 ? "block" : "none",
              }}
            >
              <TextField
                margin="normal"
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                error={this.state.error_id === this._ids.fname}
                helperText={
                  this.state.error_id === this._ids.fname
                    ? this.state.errorText
                    : ""
                }
                id={this._ids.fname}
                label="First Name"
              />
              <TextField
                margin="normal"
                variant="outlined"
                fullWidth
                error={this.state.error_id === this._ids.lname}
                helperText={
                  this.state.error_id === this._ids.lname
                    ? this.state.errorText
                    : ""
                }
                id={this._ids.lname}
                label="Last Name"
                name="lastName"
                autoComplete="lname"
              />
              <TextField
                margin="normal"
                variant="outlined"
                required
                fullWidth
                error={this.state.error_id === this._ids.username}
                helperText={
                  this.state.error_id === this._ids.username
                    ? this.state.errorText
                    : ""
                }
                id={this._ids.username}
                label="Pick a user name"
                name="userName"
                autoComplete="uname"
              />
            </div>
            {/* Step 2: Bio data and avatar*/}
            <div
              style={{
                display: this.state.step === 2 ? "block" : "none",
              }}
            >
              <input
                type="file"
                id={this._ids.proxyPicker}
                className={classes.hidden}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => document.getElementById(this._ids.proxyPicker)?.click()}
                startIcon={<CloudUpload />}
              >
                Choose an Avatar
              </Button>
              <TextField
                margin="normal"
                variant="outlined"
                fullWidth
                id={this._ids.bio}
                label="Add something about yourself"
                name="bioData"
                multiline
                error={this.state.error_id === this._ids.bio}
                helperText={
                  this.state.error_id === this._ids.bio
                    ? this.state.errorText
                    : ""
                }
              />
            </div>
          </form>
          <Grid container>
            <Grid sm={6} xs={12} style={{ textAlign: "center" }} item>
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
            <Grid sm={6} xs={12} style={{ textAlign: "center" }} item>
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
          value={(this.state.step / 3) * 100}
        />
      </Container>
    );
  }
}

export default withStyles(Styles)(SignUp);
