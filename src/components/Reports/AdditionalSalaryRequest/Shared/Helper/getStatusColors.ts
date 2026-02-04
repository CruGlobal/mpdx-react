import { Theme } from '@mui/material';

export const getStatusColors = (
  theme: Theme,
  isOverMax: boolean,
  remainingInMaxAllowable: number,
) => ({
  headerBackground: isOverMax
    ? theme.palette.mpdxYellow.main
    : theme.palette.mpdxBlue.light,
  primary: isOverMax
    ? theme.palette.statusWarning.main
    : theme.palette.mpdxBlue.main,
  total: isOverMax
    ? theme.palette.statusDanger.main
    : theme.palette.mpdxBlue.main,
  remaining:
    remainingInMaxAllowable < 0
      ? theme.palette.statusDanger.main
      : theme.palette.text.secondary,
});
