import 'reflect-metadata';

import * as Firebase from 'firebase';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { bind } from './utils/di';

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

ReactDOM.render(
  <h1>HVKZ Web Application</h1>,
  document.getElementById('root') as HTMLElement
);

serviceWorker.register();
