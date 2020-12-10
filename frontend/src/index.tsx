import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import App from "./App";
import theme from "./styles/theme";
import { UserContextProvider } from "./utils/UserContext";
import * as serviceWorker from "./serviceWorker";

let render = ReactDOM.render;

// If the app was pre-rendered, then we shouldn't re-render it
// Instead, we should hydrate it.
if (document.getElementById("app-root")?.innerHTML !== "")
  render = ReactDOM.hydrate;

render(
  <React.StrictMode>
    <Router>
      <UserContextProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </UserContextProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("app-root")
);

serviceWorker.register();
