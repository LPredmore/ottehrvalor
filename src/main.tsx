
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { ErrorBoundary } from '@sentry/react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import config from './config/env';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

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

if (!config.AUTH0_CLIENT_ID) {
  console.error('Missing AUTH0_CLIENT_ID configuration');
}

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Auth0Provider
          domain={config.AUTH0_DOMAIN}
          clientId={config.AUTH0_CLIENT_ID}
          authorizationParams={{
            audience: config.AUTH0_AUDIENCE,
            redirect_uri: config.AUTH0_REDIRECT_URI,
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
