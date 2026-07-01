import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

export const StyledFilterButton = styled(Button)({
  color: theme.palette.mpdxGrayDark.main,
  borderColor: theme.palette.mpdxGrayDark.main,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGrayLight.main,
    borderColor: theme.palette.mpdxGrayDark.main,
  },
});
