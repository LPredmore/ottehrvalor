
import './index.css';
import './lib/i18n';
import hasOwn from 'object.hasown';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.global ||= window;

// polyfill for fixing missing hasOwn Object property in some browsers
if (!Object.hasOwn) {
  hasOwn.shim();
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
