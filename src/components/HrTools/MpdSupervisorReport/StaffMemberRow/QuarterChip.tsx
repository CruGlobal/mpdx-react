import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { healthColor } from '../helpers';

// Shared by the staff rows and the report legend, so the legend's sample
// chips always look like the real ones.
export const QuarterChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'health',
})<{ health: MpdHealthStatusEnum }>(({ health }) => {
  const { bg, color } = healthColor(theme, health);
  return {
    height: 22,
    fontWeight: 600,
    backgroundColor: bg,
    color: color,
    minWidth: '80px',
    '& .MuiChip-label': {
      paddingInline: theme.spacing(1),
    },
  };
});
