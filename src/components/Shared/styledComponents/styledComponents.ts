import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));
