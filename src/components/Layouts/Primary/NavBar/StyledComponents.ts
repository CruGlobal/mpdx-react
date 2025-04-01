import { Button, ListItem, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const LeafListItem = styled(ListItem)({
  display: 'flex',
  paddingTop: 0,
  paddingBottom: 0,
}) as unknown as typeof ListItem;

export const LeafButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: '10px 8px',
  justifyContent: 'flex-start',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
}));

export const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: 16,
  marginRight: 'auto',
  textAlign: 'left',
  lineHeight: 1.5,
}));
