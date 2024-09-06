import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ToolsGridContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1000px',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },
}));
