import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledIconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'iconBgColor',
})<{ iconBgColor?: string }>(({ theme, iconBgColor }) => ({
  backgroundColor: iconBgColor || theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
