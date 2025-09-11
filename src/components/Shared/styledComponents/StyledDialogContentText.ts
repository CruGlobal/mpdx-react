import { DialogContentText } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialogContentText = styled(DialogContentText)(
  ({ theme }) => ({
    color: theme.palette.cruGrayDark.main,
  }),
);
