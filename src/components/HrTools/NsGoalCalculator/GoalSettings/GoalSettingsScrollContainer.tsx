import { styled } from '@mui/material';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';

/** Padded, full-height scroll area shared by the Goal Settings panes. */
export const GoalSettingsScrollContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
    overflow: 'auto',
    position: 'relative',
  },
}));
