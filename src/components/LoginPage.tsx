
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Card, CardContent, Tab, Tabs, Button, Typography } from '@mui/material';
import config from '../config/env';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { loginWithRedirect } = useAuth0();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogin = async (role: 'Clinician' | 'Client') => {
    // Store the selected role in sessionStorage
    sessionStorage.setItem('userRole', role);
    
    // Redirect to Auth0 login
    await loginWithRedirect({
      authorizationParams: {
        redirect_uri: config.AUTH0_REDIRECT_URI,
      },
    });
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ padding: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="login tabs"
            >
              <Tab label="Clinician Login" id="login-tab-0" />
              <Tab label="Client Login" id="login-tab-1" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Welcome, Clinician
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                Access your EHR dashboard and patient management tools
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleLogin('Clinician')}
                sx={{ py: 1.5 }}
              >
                Log in as Clinician
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Welcome, Client
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                Access your patient portal and manage your appointments
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleLogin('Client')}
                sx={{ py: 1.5 }}
              >
                Log in as Client
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
