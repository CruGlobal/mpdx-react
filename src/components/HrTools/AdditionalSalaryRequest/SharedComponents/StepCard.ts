import { Card, styled } from '@mui/material';

export const StepCard = styled(Card)(({ theme }) => ({
  '.MuiCardHeader-root': {
    padding: theme.spacing(3, 2),
  },
  '.MuiCardContent-root': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    '> .MuiTypography-root': {
      paddingLeft: theme.spacing(1),
    },
    '> .MuiDivider-root': {
      marginBlock: theme.spacing(2),
    },
  },
  '.MuiTableCell-head.MuiTableCell-root': {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  '.MuiTableCell-head.MuiTableCell-root:first-of-type': {
    width: '50%',
  },
  '.MuiTableCell-root': {
    padding: theme.spacing(2),
  },
}));
