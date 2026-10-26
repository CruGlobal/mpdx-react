import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const EmptyTableWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxGrayLight.main,
  minHeight: 300,
  maxWidth: '97%',
  margin: 'auto',
  padding: theme.spacing(2),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    minWidth: 700,
  },
}));
