import { Box, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

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

export const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
});

export const SimpleScreenOnly = styled(Box)(() => ({
  '@media print': {
    display: 'none',
  },
}));

export const SimplePrintOnly = styled(Box)(() => ({
  display: 'none',
  '@media print': {
    display: 'block',
  },
}));
