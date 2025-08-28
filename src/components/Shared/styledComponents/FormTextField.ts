import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));
