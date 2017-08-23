import * as React from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import { Auth } from './auth';
import { ChatsPage } from './modules/chats';

export const Application: React.SFC = () => (
  <Router>
    <Auth>
      <Route path="/">
        <Switch>
          <Redirect exact={true} from="/" to="/chats" />
          <Route exact={true} path="/chats" component={ChatsPage} />
        </Switch>
      </Route>
    </Auth>
  </Router>
);
