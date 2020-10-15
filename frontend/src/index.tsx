import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import App from "./App";
import theme from "./styles/theme";
import * as serviceWorker from "./serviceWorker";

let render = ReactDOM.render;

// If the app was pre-rendered, then we shouldn't re-render it
// Instead, we should hydrate it.
if (document.getElementById("app-root")?.innerHTML !== "")
  render = ReactDOM.hydrate;

render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("app-root")
);

serviceWorker.unregister();
