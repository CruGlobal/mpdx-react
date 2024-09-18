import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LargeButton = styled(Button)(({ theme }) => ({
  fontSize: theme.spacing(4),
}));
