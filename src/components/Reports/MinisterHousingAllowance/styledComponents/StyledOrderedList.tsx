import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledOrderedListProps {
  start: number;
}

export const StyledOrderedList = styled(Box)<StyledOrderedListProps>({
  '& li::marker': {
    content: 'counters(list-item, ".") ".\\00a0\\00a0"',
  },
});
