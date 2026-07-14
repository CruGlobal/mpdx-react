import { styled } from '@mui/material';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';

/**
 * Padded, full-height scroll area shared by the Goal Settings panes.
 *
 * The spacing(4) padding is load-bearing: GoalSettingsForm's StickyActionBar
 * breaks out of it with matching spacing(-4) margins. Keep the padding at
 * spacing(4) unless you update StickyActionBar to match.
 */
export const GoalSettingsScrollContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
    overflow: 'auto',
  },
}));
