import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

export const StyledFilterButton = styled(Button)({
  color: theme.palette.mpdxGrayDark.main,
  borderColor: theme.palette.mpdxGrayDark.main,
  borderRadius: theme.spacing(1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.mpdxGrayLight.main,
    borderColor: theme.palette.mpdxGrayDark.main,
  },
});
