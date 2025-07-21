
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export const CallbackHandler: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Get the user role from sessionStorage
      const userRole = sessionStorage.getItem('userRole');
      
      // Redirect based on role
      if (userRole === 'Clinician') {
        navigate('/ehr', { replace: true });
      } else if (userRole === 'Client') {
        navigate('/intake', { replace: true });
      } else {
        // Fallback if no role is found
        console.warn('No user role found in sessionStorage, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (error) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" color="error">
          Authentication Error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1">
        Completing authentication...
      </Typography>
    </Box>
  );
};
