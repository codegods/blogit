import React from "react";
import url_for from "./url_for";

interface Context {
  username: string;
  avatarUrl: string;
  name: string;
  refresh(): Promise<Context> | void;
}

const UserContext = React.createContext<Context>({
  username: "",
  avatarUrl: "",
  name: "",
  refresh: () => {},
});

class UserContextProvider extends React.Component {
  state: Context;
  constructor(props: {}) {
    super(props);
    this.state = {
      username: "",
      avatarUrl: "",
      name: "",
      // For some reason I am not aware of, directly referencing the
      // refresh function over here was breaking things by changing the
      // object referred by `this`. Making an anonymous arrow function to
      // kind of "proxy" the refresh function fixed it though.
      refresh: () => this.refresh(),
    };
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  refresh(): Promise<Context> {
    return new Promise((resolve, reject) => {
      fetch(url_for("api.user_info"), {
        credentials: "same-origin",
      }).then((res) => {
        if (!res.ok) {
          reject({});
          this.setState({
            username: "",
            avatarUrl: "",
            name: "",
          });
        } else {
          res.json().then((json) => {
            resolve(json);
            this.setState(json);
          });
        }
      });
    });
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

const withUserContext = <PropTypes extends { context: Context }>(
  Component: React.ComponentType<PropTypes>
) => {
  return (props: Omit<PropTypes, "context">) => {
    return (
      <UserContext.Consumer>
        {(context) => <Component {...(props as PropTypes)} context={context} />}
      </UserContext.Consumer>
    );
  };
};

export type UserContextType = Context;
export { UserContext, UserContextProvider, withUserContext };
