import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { helpButtonSpace } from 'src/components/Helpjuice/helpButtonSpace';

export const PageContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  // The content overflows this fixed-height wrapper, so the end room is an empty block after it
  '&:after': {
    content: '""',
    width: '100%',
    display: 'block',
    ...helpButtonSpace(theme),
  },
}));
