import 'reflect-metadata';

import * as Firebase from 'firebase';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';
import { enableLogging } from 'mobx-logger';

import { Auth } from './auth';
import * as serviceWorker from './serviceWorker';
import { bind } from './utils/di';

enableLogging({
  action: true,
  reaction: true
});

const firebaseApplication = Firebase.initializeApp({
  apiKey: 'AIzaSyAf0GPyWWcbBKTWP6PMUklpAeYlPkH-ZNo',
  authDomain: 'hvkz-ad4af.firebaseapp.com',
  databaseURL: 'https://hvkz-ad4af.firebaseio.com',
  projectId: 'hvkz-ad4af',
  storageBucket: 'hvkz-ad4af.appspot.com',
  messagingSenderId: '868647463015'
}, 'web'); // tslint:disable-line:align

bind(Firebase.app, firebaseApplication);
bind(Firebase.auth, firebaseApplication.auth());
bind(Firebase.database, firebaseApplication.database());
bind(Firebase.messaging, firebaseApplication.messaging());
bind(Firebase.storage, firebaseApplication.storage());

injectGlobal`
  html, body {
    width: 100%;
    height: 100%;
  }

  body {
    margin: 0;
    
    font-size: 16px;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
      Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  #root {
    margin: 0 auto;
    max-width: 480px;
    width: 100%;
    height: 100%;
  }
`;

ReactDOM.render(
  <Auth/>,
  document.getElementById('root') as HTMLElement
);

serviceWorker.register();
