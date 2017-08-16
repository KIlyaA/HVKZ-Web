import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <h1>HVKZ Web Application</h1>,
  document.getElementById('root') as HTMLElement
);

serviceWorker.register();
