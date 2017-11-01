import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ChatsPage } from './modules/chats/';
import { Home } from './modules/home';
import { Menu } from './modules/menu';
import { NewGroup } from './modules/new-group';
import { ChatView } from './chat-view';

import { LightBox } from './lightbox';

export const Application: React.SFC = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <LightBox />
    <Route path="/">
      <Switch>
        <Redirect exact={true} from="/" to="/chats" />
        <Route exact={true} path="/chats" component={ChatsPage} />
        <Route exact={true} path="/chats/new" component={NewGroup} />
        <Route exact={true} path="/home" component={Home} />
        <Route exact={true} path="/menu" component={Menu} />
        <Route path="/im/:chatName" component={ChatView} />
      </Switch>
    </Route>
  </div>
);
