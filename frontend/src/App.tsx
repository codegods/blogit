import React from 'react';
import { Button } from "@material-ui/core"
//import { Switch, Route } from "react-router-dom"

class App extends React.Component {
  render(){
    return (
      <div>
        <Button color="primary" variant="outlined">Hello</Button>
        {
          /**
           * <Switch>
           *  <Route />
           * </Switch>
           */
        }
      </div>
    )
  }
}
export default App;
