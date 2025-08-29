import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));
