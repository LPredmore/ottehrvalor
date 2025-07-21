
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { ErrorBoundary } from '@sentry/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Use the consolidated environment variables
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || 'https://auth.zapehr.com';
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const AUTH0_REDIRECT_URI = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin + '/callback';
const AUTH0_AUDIENCE = import.meta.env.VITE_APP_OYSTEHR_APPLICATION_AUDIENCE || 'https://api.zapehr.com';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

if (!AUTH0_CLIENT_ID) {
  console.error('Missing AUTH0_CLIENT_ID environment variable');
}

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Auth0Provider
          domain={AUTH0_DOMAIN}
          clientId={AUTH0_CLIENT_ID}
          authorizationParams={{
            audience: AUTH0_AUDIENCE,
            redirect_uri: AUTH0_REDIRECT_URI,
          }}
          cacheLocation="localstorage"
        >
          <ErrorBoundary fallback={<p>An error has occurred</p>}>
            <App />
          </ErrorBoundary>
        </Auth0Provider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
