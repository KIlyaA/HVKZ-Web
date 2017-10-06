import 'reflect-metadata';
import 'react-photoswipe/lib/photoswipe.css';

import * as Firebase from 'firebase';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import { bind } from './utils/di';

import { Auth } from './auth/index';
import { Application } from './application';

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

ReactDOM.render((
  <Router>
    <Auth>
     <Application/>
    </Auth>
  </Router>
), document.getElementById('root')); // tslint:disable-line:align
