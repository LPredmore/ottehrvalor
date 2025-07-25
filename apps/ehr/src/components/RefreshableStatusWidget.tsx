import { RefreshRounded } from '@mui/icons-material';
import { Box, Chip, CircularProgress, IconButton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { ReactElement } from 'react';
import styled from 'styled-components';

const StyledChip = styled(Chip)(() => ({
  borderRadius: '8px',
  padding: '0 9px',
  margin: 0,
  height: '24px',
  '& .MuiChip-label': {
    padding: 0,
    fontWeight: 'bold',
    fontSize: '0.7rem',
  },
}));

export interface StatusStyleObject {
  bgColor: string;
  textColor: string;
}

interface StatusChipProps<StatusType extends string | number> {
  status: StatusType;
  styleMap: Record<StatusType, StatusStyleObject>;
  lastRefreshISO: string;
  isRefreshing?: boolean;
  handleRefresh?: () => void;
}

export const RefreshableStatusChip = <StatusType extends string | number>({
  status,
  styleMap,
  lastRefreshISO,
  isRefreshing = false,
  handleRefresh,
}: StatusChipProps<StatusType>): ReactElement => {
  const chipColors = styleMap[status];

  const lastRefreshDateString: string = (() => {
    const dt = DateTime.fromISO(lastRefreshISO);
    if (dt.isValid) {
      return `Last checked: ${DateTime.fromISO(lastRefreshISO).toFormat('MM/dd/yyyy')}`;
    }
    return '';
  })();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <StyledChip
        label={status}
        sx={{
          backgroundColor: chipColors.bgColor,
          color: chipColors.textColor,
        }}
      />
      {Boolean(handleRefresh) && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Rubik',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '12px',
              lineHeight: '15px',
              fontWeight: '400',
            }}
          >
            {lastRefreshDateString}
          </Typography>
          <IconButton onClick={handleRefresh} size="small">
            {isRefreshing ? <CircularProgress size="24px" /> : <RefreshRounded color="primary" />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
