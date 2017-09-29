import * as React from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import { Auth } from './auth';
import { ChatView } from './chat-view';
import { ChatsPage } from './modules/chats/';
import { Home } from './modules/home';
import { Menu } from './modules/menu/index';

export const Application: React.SFC = () => (
  <Router>
    <Auth>
      <Route path="/">
        <Switch>
          <Redirect exact={true} from="/" to="/chats" />
          <Route exact={true} path="/chats" component={ChatsPage} />
          <Route exact={true} path="/home" component={Home} />
          <Route exact={true} path="/menu" component={Menu}/>
          <Route path="/im/:chatName" component={ChatView} />
        </Switch>
      </Route>
    </Auth>
  </Router>
);
