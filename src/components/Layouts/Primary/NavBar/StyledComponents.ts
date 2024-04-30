import { Button, ListItemButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LeafListItem = styled(ListItemButton)(() => ({
  display: 'flex',
  paddingTop: 0,
  paddingBottom: 0,
}));

export const LeafButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: '10px 8px',
  justifyContent: 'flex-start',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
}));

export const Title = styled('span')(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: 16,
  marginRight: 'auto',
  textAlign: 'left',
  lineHeight: 1.5,
}));
