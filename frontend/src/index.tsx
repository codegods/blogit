import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import App from "./App";
import theme from "./styles/theme"
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <Router>
      <ThemeProvider theme={theme}>
      <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("app-root")
);

serviceWorker.unregister();
