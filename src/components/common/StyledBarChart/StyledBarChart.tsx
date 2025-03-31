import { styled } from '@mui/material/styles';
import { BarChart, ComposedChart } from 'recharts';

const styles = ({ theme }) => ({
  '.recharts-tooltip-label': {
    fontWeight: 'bold',
  },
  // Remove the color from labels in legends and tooltips to improve contrast
  '.recharts-legend-item-text, .recharts-tooltip-item span': {
    color: `${theme.palette.text.primary} !important`,
  },
  // Add a colored rectangle to tooltips
  '.recharts-tooltip-item::before': {
    content: '" "',
    display: 'inline-block',
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    marginRight: theme.spacing(0.5),
    backgroundColor: 'currentcolor',
  },
});

export const StyledBarChart = styled(BarChart)(styles);
export const StyledComposedChart = styled(ComposedChart)(styles);
