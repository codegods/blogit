import React from "react";
import url_for from "./url_for";

interface Context {
  username: string;
  avatarUrl: string;
  name: string;
  refresh(): void;
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
      refresh: this.componentDidMount,
    };
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    fetch(url_for("api.user_info"), {
      credentials: "same-origin"
    }).then(res => {
      if (!res.ok){
        this.setState({
          username: "",
          avatarUrl: "",
          name: "",
        })
      }else{
        res.json().then(json => {
          this.setState(json)
        })
      }
    })
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

const withUserContext = <PropTypes extends {context: Context}>(
  Component: React.ComponentType<PropTypes>
) => {
  return (props: Omit<PropTypes, "context">) => {
    return (
      <UserContext.Consumer>
        {(context) => <Component {...props as PropTypes} context={context} />}
      </UserContext.Consumer>
    );
  };
};

export type UserContextType = Context;
export { UserContext, UserContextProvider, withUserContext}
