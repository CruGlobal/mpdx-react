import { Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SideContainerText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0, 1),
}));

export const ContrastLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecorationColor: theme.palette.primary.contrastText,
}));

export const ContactInfoText = styled('span')({
  overflow: 'hidden',
});
