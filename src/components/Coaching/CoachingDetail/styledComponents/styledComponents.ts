import { Button, CardContent, TableCell, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

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

export const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

export const LoadMoreButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));
