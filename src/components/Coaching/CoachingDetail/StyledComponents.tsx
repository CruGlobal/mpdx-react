import { Link, TableCell, TableRow, Typography } from '@mui/material';
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

export const HeaderRow = styled(TableRow)({
  td: {
    fontWeight: 'bold',
  },
});

export const DividerRow = styled(TableRow)(({ theme }) => ({
  td: {
    border: 'none',
    padding: `${theme.spacing(2)} 0`,
  },
}));

export const AlignedTableCell = styled(TableCell)({
  border: 'none',
  textAlign: 'right',
  ':first-of-type': {
    textAlign: 'unset',
  },
});
