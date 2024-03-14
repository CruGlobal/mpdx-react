import { List, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));

export const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
  paddingTop: theme.spacing(0),
}));
