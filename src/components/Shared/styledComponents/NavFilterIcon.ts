import FilterList from '@mui/icons-material/FilterList';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

export const NavFilterIcon = styled(FilterList)(() => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
