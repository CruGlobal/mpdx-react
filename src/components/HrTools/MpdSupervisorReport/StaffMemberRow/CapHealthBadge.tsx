import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  MpdCapHealthEnum,
  MpdHealthStatusEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { capHealthLabel } from '../Filters/mpdSupervisorReportFilters';
import { healthColor } from '../helpers';

const quarterColor: Record<MpdCapHealthEnum, MpdHealthStatusEnum> = {
  [MpdCapHealthEnum.Healthy]: MpdHealthStatusEnum.Green,
  [MpdCapHealthEnum.OnTrack]: MpdHealthStatusEnum.Yellow,
  [MpdCapHealthEnum.NeedsAttention]: MpdHealthStatusEnum.Red,
};

// Outlined so it never reads as another filled quarter chip
const BadgeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'capHealth',
})<{ capHealth: MpdCapHealthEnum }>(({ capHealth }) => {
  const { color } = healthColor(theme, quarterColor[capHealth]);
  return {
    height: 22,
    fontWeight: 600,
    color,
    borderColor: color,
    '& .MuiChip-label': { paddingInline: theme.spacing(1) },
  };
});

interface CapHealthBadgeProps {
  capHealth: MpdCapHealthEnum | null | undefined;
  /** The percent the grade came from, shown in the tooltip */
  percentOfCap?: number | null;
}

/** A staff member's health by last month's % of Personal CAP; nothing without a CAP. */
export const CapHealthBadge: React.FC<CapHealthBadgeProps> = ({
  capHealth,
  percentOfCap,
}) => {
  const { t } = useTranslation();
  const { formatPercentage } = useFormatters();
  if (!capHealth) {
    return null;
  }

  const badge = (
    <BadgeChip
      data-testid="cap-health-badge"
      capHealth={capHealth}
      label={capHealthLabel(t, capHealth)}
      variant="outlined"
      size="small"
    />
  );
  if (percentOfCap === null || percentOfCap === undefined) {
    return badge;
  }
  return (
    <Tooltip
      title={t('{{percent}} of Personal CAP last month', {
        percent: formatPercentage(percentOfCap, 1),
      })}
    >
      {badge}
    </Tooltip>
  );
};
