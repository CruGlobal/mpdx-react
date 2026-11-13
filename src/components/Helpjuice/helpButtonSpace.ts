import { Theme } from '@mui/material/styles';

/**
 * Bottom padding for the end of a scroll area, so the last control can scroll up clear of the
 * help button (see pages/helpjuice.css). On phones the 44px button sits 16px from the bottom. From
 * 600px up the 60px button sits 100px from the bottom. Spread it into styled() or pass it as sx.
 */
export const helpButtonSpace = (theme: Theme) => ({
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('sm')]: {
    paddingBottom: theme.spacing(22),
  },
});
