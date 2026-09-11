import { DialogContentText } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialogContentText: typeof DialogContentText = styled(
  DialogContentText,
)(({ theme }) => ({
  color: theme.palette.mpdxGrayDark.main,
}));
