import { FormControl, FormLabel, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LogFormLabel = styled(FormLabel)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  '& span': {
    color: theme.palette.error.main,
  },
}));

export const LogFormControl = styled(FormControl)(() => ({
  width: '100%',
}));

export const LogTextField = styled(TextField)(({ theme }) => ({
  '& div': {
    padding: theme.spacing(1),
  },
}));
