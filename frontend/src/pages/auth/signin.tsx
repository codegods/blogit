import React from "react";
import {
  Button,
  TextField,
  LinearProgress,
  Link,
  Grid,
  Container,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import { signin as Styles } from "../../styles/auth";
import url_for from "../../utils/url_for";

class SignIn extends React.Component<WithStyles<typeof Styles>> {
  state: {
    error: string;
    isLoading: boolean;
    error_with: string;
  };
  _ids: {
    username: string;
    password: string;
  };
  constructor(props: WithStyles<typeof Styles>) {
    super(props);
    this.state = {
      error: "",
      error_with: "",
      isLoading: false,
    };
    this._ids = {
      username: "auth-signin-email",
      password: "auth-signin-pasword",
    };
    this.logIn = this.logIn.bind(this);
  }

  logIn() {
    this.setState({ isLoading: true });
    fetch(url_for("api.auth.login"), {
      method: "POST",
      body: JSON.stringify({

        // Give it the vaues it needs
        username: (document.getElementById(
          this._ids.username
        ) as HTMLInputElement)?.value,
        password: (document.getElementById(
          this._ids.password
        ) as HTMLInputElement)?.value,
      }),
    }).then((res) => {
      res.json().then((json) => {

        // Done loading
        this.setState({ isLoading: false });
        /**@todo Change the url to a possible refferer */
        if (res.ok) alert("Successfull");

        // Unauthorised access
        if (res.status === 403)
          return this.setState({
            error: json.message,
            error_with: json.error_with,
          });
      });
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id={this._ids.username}
              label="Email Address"
              name="email"
              autoComplete="email"
              error={this.state.error_with === "username"}
              helperText={
                this.state.error_with === "username" ? this.state.error : ""
              }
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id={this._ids.password}
              error={this.state.error_with === "password"}
              helperText={
                this.state.error_with === "password" ? this.state.error : ""
              }
              autoComplete="current-password"
            />
          </form>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={this.logIn}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
          </Grid>
          <LinearProgress
            className={classes.progress}
            variant={this.state.isLoading ? "indeterminate" : "determinate"}
            value={0}
          />
        </div>
      </Container>
    );
  }
}

export default withStyles(Styles)(SignIn);
