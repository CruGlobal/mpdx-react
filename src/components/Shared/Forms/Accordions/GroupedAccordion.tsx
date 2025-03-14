import { Accordion } from '@mui/material';
import { styled } from '@mui/material/styles';

export const GroupedAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,

  // Hide built-in borders
  '&:before': {
    content: 'none',
  },

  // Collapse adjacent borders by removing the top border of accordions that come right after another accordion
  '& + &': {
    borderTop: 0,
  },

  '.MuiAccordionSummary-root.Mui-expanded': {
    backgroundColor: theme.palette.mpdxYellow.main,
  },
}));
