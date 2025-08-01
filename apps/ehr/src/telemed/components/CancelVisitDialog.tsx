import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import React, { ReactElement, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CancellationReasonOptionsProviderSideTelemed } from 'utils';
import { cancelTelemedAppointment } from '../../api/api';
import { useApiClients } from '../../hooks/useAppClients';

interface CancelVisitDialogProps {
  onClose: () => void;
}

const CancelVisitDialog = ({ onClose }: CancelVisitDialogProps): ReactElement => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<boolean>(false);
  const [otherReason, setOtherReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const { oystehrZambda } = useApiClients();
  const { id: appointmentID } = useParams();
  const navigate = useNavigate();

  const cancellationReasons = Object.values(CancellationReasonOptionsProviderSideTelemed);

  const handleReasonChange = (event: SelectChangeEvent<string>): void => {
    setReason(event.target.value);
    if (event.target.value !== 'Other') {
      setOtherReason('');
    }
  };

  const handleOtherReasonChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setOtherReason(event.target.value);
  };

  const handleCancelAppointment = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(false);
    if (!reason || (reason === 'Other' && !otherReason)) {
      return;
    }
    setIsCancelling(true);
    if (!oystehrZambda) throw new Error('Zambda client not found');

    if (cancellationReasons.find((r) => r === reason) === undefined) {
      throw new Error(`Invalid cancellation reason: ${reason}`);
    }

    const typedReason = reason as CancellationReasonOptionsProviderSideTelemed;
    let errorReceived = false;
    try {
      const response = await cancelTelemedAppointment(oystehrZambda, {
        appointmentID: appointmentID || '',
        cancellationReason: typedReason,
        cancellationReasonAdditional: otherReason,
      });
      console.log('Appointment cancelled successfully', response);
    } catch (error) {
      setError(true);
      errorReceived = true;
      console.error('Failed to cancel appointment', error);
    } finally {
      setIsCancelling(false);
      if (!errorReceived) {
        onClose();
        navigate('/telemed/appointments');
      }
    }
  };

  const buttonSx = {
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: 6,
    mb: 2,
    ml: 1,
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth
      disableScrollLock
      sx={{
        '.MuiPaper-root': {
          padding: 1,
          width: '444px',
          maxWidth: 'initial',
        },
      }}
    >
      <form onSubmit={(e) => handleCancelAppointment(e)}>
        <DialogTitle variant="h4" color="primary.dark" sx={{ width: '100%' }}>
          Cancellation reason
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth required sx={{ mt: 2 }}>
            <InputLabel id="cancellation-reason-label">Cancellation Reason</InputLabel>
            <Select
              labelId="cancellation-reason-label"
              id="cancellation-reason"
              value={reason}
              label="Cancellation Reason"
              onChange={handleReasonChange}
            >
              {cancellationReasons.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {reason === 'Other' && (
            <FormControl fullWidth required>
              <TextField
                id="other-reason"
                label="Reason"
                variant="outlined"
                fullWidth
                required={true}
                margin="normal"
                value={otherReason}
                onChange={handleOtherReasonChange}
              />
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', marginLeft: 1 }}>
          <LoadingButton
            loading={isCancelling}
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            sx={buttonSx}
          >
            Cancel visit
          </LoadingButton>
          <Button onClick={onClose} variant="text" color="primary" size="medium" sx={buttonSx}>
            Keep
          </Button>
        </DialogActions>
        {error && (
          <Typography color="error" variant="body2" my={1} mx={2}>
            There was an error cancelling this appointment, please try again.
          </Typography>
        )}
      </form>
    </Dialog>
  );
};

export default CancelVisitDialog;
