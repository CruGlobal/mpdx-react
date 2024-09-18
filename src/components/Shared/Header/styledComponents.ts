import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StickyBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(10),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
  height: theme.spacing(10),
  zIndex: '700',
  background: theme.palette.common.white,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const StickyButtonHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: 'white',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  position: 'sticky',
  top: '80px',
  zIndex: '100',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.cruGrayLight.main,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'start',
    top: '56px',
  },
}));
