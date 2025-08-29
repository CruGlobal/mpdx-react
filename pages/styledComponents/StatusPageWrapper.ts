import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StatusPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));
