
import './index.css';
import './lib/i18n';
import { Auth0Provider } from '@auth0/auth0-react';
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

// Use consolidated environment variables with fallbacks to legacy ones
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.VITE_APP_AUTH_URL || '';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID || '';
const AUTH0_REDIRECT_URI = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/redirect`;
const AUTH0_AUDIENCE = import.meta.env.VITE_APP_OYSTEHR_APPLICATION_AUDIENCE || import.meta.env.VITE_APP_AUTH0_AUDIENCE || '';

if (!AUTH0_CLIENT_ID || !AUTH0_AUDIENCE) {
  throw new Error('Client ID or audience not found');
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        connection: 'sms',
        redirectUri: AUTH0_REDIRECT_URI,
        audience: AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access',
      }}
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        if (!appState || !appState.target) {
          return;
        }
        localStorage.setItem('redirectDestination', appState.target);
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
