import { useTheme } from '@mui/material/styles';

interface IndicatorColors {
  ownership: string;
  success: string;
  consistency: string;
  depth: string;
}

export const useIndicatorColors = (): IndicatorColors => {
  const { palette } = useTheme();

  return {
    ownership: palette.cyan.main,
    success: palette.pink.main,
    consistency: palette.green.main,
    depth: palette.yellow.main,
  };
};
