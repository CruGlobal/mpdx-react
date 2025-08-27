import FilterList from '@mui/icons-material/FilterList';
import {
  Box,
  Checkbox,
  DialogActions,
  DialogContentText,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

export const LoadingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  maxWidth: '97%',
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
}));

export const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

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

export const StyledDialogContentText = styled(DialogContentText)(
  ({ theme }) => ({
    color: theme.palette.cruGrayDark.main,
  }),
);

export const Header = styled(Typography)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

export const StyledCheckbox = styled(Checkbox)(() => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

export const NavFilterIcon = styled(FilterList)(() => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

export const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: 'space-between',
}));

export const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));
