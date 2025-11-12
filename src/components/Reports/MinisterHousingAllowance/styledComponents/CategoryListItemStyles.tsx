import { ListItemIcon, SxProps, Theme, styled } from '@mui/material';

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
