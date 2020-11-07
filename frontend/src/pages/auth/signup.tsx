import React from "react";
import {
  Button,
  TextField,
  Container,
  WithStyles,
  LinearProgress,
  Grid,
  Typography,
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
    file: string;
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
      file: "",
    };
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.fileHandler = this.fileHandler.bind(this);

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

  fileHandler(): File | null{
    let elem = document.getElementById(
      this._ids.proxyPicker
    ) as HTMLInputElement;
    let file = elem.files && elem.files[0];

    // Correct unit
    if (file) {
      let unit = "kB";
      let size = file.size / 1024;
      if (size > 1024) {
        size = size / 1024;
        unit = "MB";
      }
      this.setState({
        file: `${file.name} (Size: ${Math.round(size) + unit})`,
      });
    }
    // File sizze check
    if (file && file.size > 1024 * 1024 * 5) {
      this.setState({
        isLoading: false,
        file: "File size is too large (Max 5MB)",
      });
    }
    return file;
  }

  /* This will take us to the next step */
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

    // Start the loading animation
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
        let file = this.fileHandler();
        if(file){
          // Go for validation
          Validator.validate_step_3(this.uuid, this._ids.bio, file).then(
            (res) => {
              if (res.error) {
                this.setState({
                  error_id: res.error.id,
                  errorText: res.error.message,
                  isLoading: false,
                });
              } else {
                // Checks passed, lets go to home page
                /**@todo Go to the referrer page */
                window.location.assign("/");
              }
            }
          );
        }
        break;
    }
  }

  /**
   * This will allow the user to go the previous step
   */
  prevStep(_e: React.ChangeEvent<{}>) {
    if (this.state.step > 0) {
      this.setState({
        step: this.state.step - 1,
        error: null,
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
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
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
                onChange={this.fileHandler}
                accept="image/*"
              />
              <Grid container style={{textAlign: "center"}}>
                <Grid item sm={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      document.getElementById(this._ids.proxyPicker)?.click()
                    }
                    startIcon={<CloudUpload />}
                    disabled={this.state.isLoading}
                  >
                    Choose an Avatar
                  </Button>
                </Grid>
                <Grid item sm={12}>
                  <Typography variant="caption" component="span">
                    {this.state.file || "No file chosen (Max Size 5MB)"}
                  </Typography>
                </Grid>
              </Grid>
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
                disabled={this.state.isLoading}
              />
            </div>
          </form>
          <Grid container>
            <Grid sm={6} xs={12} style={{ textAlign: "center" }} item>
              <Button
                variant="contained"
                color="secondary"
                className={classes.submit}
                disabled={this.state.step === 0 || this.state.isLoading}
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
                disabled={this.state.isLoading}
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
