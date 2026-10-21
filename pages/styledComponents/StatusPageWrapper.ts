import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StatusPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxGrayLight.main,
  height: 300,
  margin: 'auto',
  padding: theme.spacing(2),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));
