import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageContentWrapper = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  '&:after': {
    content: '""',
    width: '100%',
    height: theme.spacing(10),
    display: 'block',
  },
}));
