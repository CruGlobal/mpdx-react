import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginInline: 'auto',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: theme.spacing(100),
}));

export const LargeButton = styled(Button)(({ theme }) => ({
  fontSize: theme.spacing(4),
}));
