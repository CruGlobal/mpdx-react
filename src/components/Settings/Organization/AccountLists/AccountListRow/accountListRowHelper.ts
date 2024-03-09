import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

export const BorderBottomBox = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
  padding: theme.spacing(1),
  '&:last-child': {
    borderBottom: '0px',
  },
}));

export const HeaderBox = styled(Box)(() => ({
  fontWeight: 'bold',
  paddingX: '5px',
}));
