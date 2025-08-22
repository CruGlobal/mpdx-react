import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
}));

export const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));
