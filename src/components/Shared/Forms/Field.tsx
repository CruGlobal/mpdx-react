import {
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Select,
  Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  '& .MuiFormControlLabel-label': {
    fontWeight: '700',
  },
}));

export const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  margin: 0,
  fontSize: 16,
  color: theme.palette.text.primary,
  '&:not(:first-child)': {
    marginTop: theme.spacing(1),
  },
}));

const sharedFieldStyles = ({ theme }: { theme: Theme }) => ({
  '&:not(:first-child)': {
    marginTop: theme.spacing(1),
  },
});

export const StyledOutlinedInput = styled(OutlinedInput)(sharedFieldStyles);
export const StyledSelect = styled(Select)(sharedFieldStyles);

export enum HelperPositionEnum {
  Top = 'top',
  Bottom = 'bottom',
}
