import { useAuth0 } from '@auth0/auth0-react';
import { otherColors } from '@ehrTheme/colors';
import { createDemoVisits } from '@ehrTheme/icons';
import { LoadingButton } from '@mui/lab';
import { Alert, Snackbar, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Location } from 'fhir/r4b';
import React, { ReactElement, useState } from 'react';
import { ServiceMode } from 'utils';
import { isLocationVirtual } from 'utils/lib/fhir/location';
import { createSampleAppointments } from 'utils/lib/helpers';
import { useApiClients } from '../hooks/useAppClients';

const createAppointmentZambdaId = import.meta.env.VITE_APP_CREATE_APPOINTMENT_ZAMBDA_ID;
const intakeZambdaUrl = import.meta.env.VITE_APP_PROJECT_API_ZAMBDA_URL;

const CreateDemoVisits = (): ReactElement => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputError, setInputError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { getAccessTokenSilently } = useAuth0();
  const { oystehr } = useApiClients();

  const selectedLocation = JSON.parse(localStorage.getItem('selectedLocation') || '{}');

  const handleCreateSampleAppointments = async (
    event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    if (!selectedLocation || JSON.stringify(selectedLocation) === '{}') {
      setSnackbar({
        open: true,
        message: 'No location selected in filters, please select a location first',
        severity: 'error',
      });
      return;
    }
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    if (!formattedPhoneNumber) {
      setInputError(true);
      return;
    } else {
      setInputError(false);
    }
    try {
      setLoading(true);
      setInputError(false);
      const authToken = await getAccessTokenSilently();
      const telemedLocations = (
        await oystehr?.fhir.search<Location>({
          resourceType: 'Location',
          params: [
            { name: 'status', value: 'active' },
            { name: 'address-state:missing', value: 'false' },
          ],
        })
      )?.unbundle();
      const telemedLocation = telemedLocations?.find((loc) => isLocationVirtual(loc));
      await Promise.all([
        createSampleAppointments({
          oystehr,
          authToken,
          phoneNumber: formattedPhoneNumber,
          serviceMode: ServiceMode['in-person'],
          createAppointmentZambdaId,
          zambdaUrl: intakeZambdaUrl,
          selectedLocationId: selectedLocation.id,
          projectId: import.meta.env.VITE_APP_PROJECT_ID,
          demoData: { numberOfAppointments: 5 },
        }),
        telemedLocation
          ? createSampleAppointments({
              oystehr,
              serviceMode: ServiceMode.virtual,
              authToken,
              phoneNumber: formattedPhoneNumber,
              createAppointmentZambdaId,
              zambdaUrl: intakeZambdaUrl,
              selectedLocationId: telemedLocation?.id,
              projectId: import.meta.env.VITE_APP_PROJECT_ID,
              demoData: { numberOfAppointments: 5 },
              locationState: telemedLocation?.address?.state,
            })
          : Promise.resolve(),
      ]);
      setSnackbar({
        open: true,
        message: 'Appointments created successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error creating appointments',
        severity: 'error',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string): string | null => {
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length === 10) {
      return digitsOnly;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return digitsOnly.slice(1);
    }
    return null;
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string): void => {
    // cSpell:disable-next clickaway
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value;
    setPhoneNumber(input);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: otherColors.lightBlue,
        px: 2.5,
        py: 1.5,
        borderRadius: 2,
        mt: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="h6" color="primary.main">
          Lack of test data? Create demo visits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please enter a phone number to create visits for this user
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, alignItems: 'center' }}>
        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={handleChange}
          size="small"
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: inputError ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
              },
              '& input': {
                backgroundColor: 'white',
              },
            },
          }}
          required
          error={inputError}
          helperText={inputError ? 'Please enter a valid phone number' : ''}
        />
        <LoadingButton
          loading={loading}
          onClick={handleCreateSampleAppointments}
          size="small"
          type="submit"
          sx={{
            borderRadius: 10,
            border: '1px solid #2169F5',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,

            px: 2,
            py: 0.75,
            flexShrink: 0,
            minHeight: 0,
            '& .MuiButton-startIcon': {
              margin: 0,
            },
          }}
          startIcon={<img src={createDemoVisits} alt="create demo visits" style={{ width: 16, height: 16 }} />}
        >
          <Typography variant="button" sx={{ textTransform: 'none', textWrap: 'nowrap' }}>
            Create Demo Visits
          </Typography>
        </LoadingButton>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateDemoVisits;
