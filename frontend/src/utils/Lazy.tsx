import React from "react";


interface imported_component {
    // Looking for the perfect type that fits here
    // Help needed
  default: any;
  [index: string]: any;
}

interface LazyState {
    // Looking for the perfect type that fits here
    // Help needed
  component?: any;
}

interface Props {
  [index: string]: any;
}

let importfn: () => Promise<imported_component>;

let Lazy = (import_fn: typeof importfn) => {
  return class extends React.Component {
    state: LazyState;

    constructor(props: Props) {
      super(props);
      this.state = {};
    }

    componentDidMount() {
      this.context.load();
      import_fn()
        .then((component) => {
          this.context.loadOff();
          this.setState({
            component: component.default,
          });
        })
        .catch((e) => {
            this.context.loadOff()
          console.warn(
            "Loading a lazy component failed with the following error:",
            e.message
          );
        });
    }

    render() {
      if (this.state.component){
        return <this.state.component {...this.props} />;
      }
      return null;
    }
  };
};

export default Lazy;
