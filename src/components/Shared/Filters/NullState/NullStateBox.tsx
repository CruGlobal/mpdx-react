import { styled, Box } from '@mui/material';

export const NullStateBox = styled(Box)(({ theme }) => ({
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.cruGrayMedium.main,
  color: theme.palette.cruGrayDark.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: theme.palette.cruGrayLight.main,
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  textAlign: 'center',
  boxShadow: `0px 0px 5px ${theme.palette.cruGrayMedium.main} inset`,
}));
