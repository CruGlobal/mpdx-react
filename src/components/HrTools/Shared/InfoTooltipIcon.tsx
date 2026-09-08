import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material';

export const InfoTooltipIcon = styled(InfoIcon)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  verticalAlign: 'middle',
  cursor: 'pointer',
  color: theme.palette.mpdxGrayDark.main,
  fontSize: '1rem',
}));
