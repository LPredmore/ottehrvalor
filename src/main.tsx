import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { ErrorBoundary } from '@sentry/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import App from './App'
import LoginPage from './LoginPage'
import CallbackHandler from './CallbackHandler'
import ProtectedClinicianApp from './ProtectedClinicianApp'
import ProtectedClientApp from './ProtectedClientApp'

const domain = import.meta.env.VITE_AUTH0_DOMAIN!
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI!
const audience = import.meta.env.VITE_AUTH0_AUDIENCE!

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false }
  }
})

const theme = createTheme({
  palette: { primary: { main: '#1976d2' } }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri, audience }}
    >
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/callback" element={<CallbackHandler />} />
                <Route path="/ehr/*" element={<ProtectedClinicianApp />} />
                <Route path="/intake/*" element={<ProtectedClientApp />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Auth0Provider>
  </React.StrictMode>
)
