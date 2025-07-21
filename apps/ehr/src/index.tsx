
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { ErrorBoundary } from '@sentry/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Use consolidated environment variables with fallbacks to legacy ones
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.VITE_APP_OYSTEHR_APPLICATION_DOMAIN || '';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || import.meta.env.VITE_APP_OYSTEHR_APPLICATION_CLIENT_ID || '';
const AUTH0_REDIRECT_URI = import.meta.env.VITE_AUTH0_REDIRECT_URI || import.meta.env.VITE_APP_OYSTEHR_APPLICATION_REDIRECT_URL || window.location.origin;
const AUTH0_AUDIENCE = import.meta.env.VITE_APP_OYSTEHR_APPLICATION_AUDIENCE || 'https://api.zapehr.com';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        authorizationParams={{
          audience: AUTH0_AUDIENCE,
          redirect_uri: AUTH0_REDIRECT_URI,
          connection: import.meta.env.VITE_APP_OYSTEHR_CONNECTION_NAME,
        }}
        cacheLocation="localstorage"
      >
        <ErrorBoundary fallback={<p>An error has occurred</p>}>
          <App />
        </ErrorBoundary>
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>
);
