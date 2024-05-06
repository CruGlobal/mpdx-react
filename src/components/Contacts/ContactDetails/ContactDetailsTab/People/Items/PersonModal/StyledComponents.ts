import { FormControlLabel, Grid, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ContactInputField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PrimaryControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const VerticallyCenteredGrid = styled(Grid)(() => ({
  margin: 'auto',
}));
