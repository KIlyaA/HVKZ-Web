import * as React from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import { Auth } from './auth';

export const Application: React.SFC = () => (
  <Router>
    <Auth>
      <Route path="/">
        <Switch>
          <Redirect exact={true} from="/" to="/chats" />
          <Route path="chats"/>
        </Switch>
      </Route>
    </Auth>
  </Router>  
);
