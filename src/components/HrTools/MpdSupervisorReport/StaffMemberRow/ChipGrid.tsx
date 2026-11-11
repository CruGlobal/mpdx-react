import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

// Below md the rows are too narrow for the page's column headers, so the chips
// drop under the name and each one carries its own caption. Shared by the
// row's balance chips and the drawer header's quarter chips, which show their
// captions at every width.
export const chipGridSx = {
  [theme.breakpoints.down('md')]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: theme.spacing(1, 2),
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
};

export const ChipCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  columnGap: theme.spacing(1),
  minWidth: 0,
}));

export const ChipCaption = styled(Typography)(({ theme }) => ({
  display: 'none',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));
