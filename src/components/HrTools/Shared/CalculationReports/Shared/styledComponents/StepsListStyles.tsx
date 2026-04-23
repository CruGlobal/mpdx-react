import { Box, ListItemIcon, SxProps, Theme, styled } from '@mui/material';

interface StyledOrderedListProps {
  start: number;
}

export const CategoryListItemStyles: SxProps<Theme> = (theme) => ({
  '.MuiSvgIcon-root': {
    fontSize: '1rem',
  },
  padding: 0,
  paddingLeft: theme.spacing(3),
});

export const CategoryListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

export const StyledOrderedList = styled(Box)<StyledOrderedListProps>({
  '& li::marker': {
    content: 'counters(list-item, ".") ".\\00a0\\00a0"',
  },
});
