import { Card, Typography, styled } from '@mui/material';

export const StyledCard = styled(Card)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(4),
  overflowX: 'auto',
  whiteSpace: 'nowrap',
}));

export const StyledHeaderValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  fontSize: theme.typography.h2.fontSize,
  [theme.breakpoints.down('sm')]: {
    fontSize: theme.typography.h4.fontSize,
  },
})) as typeof Typography;
