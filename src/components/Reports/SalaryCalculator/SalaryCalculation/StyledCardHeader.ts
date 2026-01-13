import { CardHeader, styled } from '@mui/material';

export const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  '.MuiCardHeader-title': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    '.MuiSvgIcon-root': {
      fontSize: '1.5rem',
    },
  },
}));
