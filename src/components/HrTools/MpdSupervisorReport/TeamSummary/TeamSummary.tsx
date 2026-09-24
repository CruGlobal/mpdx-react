import React, { useMemo } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { useManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { healthStatusOrder } from '../ReportLegend/legendCopy';
import {
  TeamSummaryRow,
  healthColor,
  healthLabel,
  summarizeTeams,
} from '../helpers';

const gradedStatuses = [
  MpdHealthStatusEnum.Red,
  MpdHealthStatusEnum.Yellow,
  MpdHealthStatusEnum.Green,
];

interface TeamCardProps {
  team: TeamSummaryRow;
  selected: boolean;
  onToggle: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, selected, onToggle }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const graded = gradedStatuses.reduce(
    (total, status) => total + team.counts[status],
    0,
  );

  return (
    <ButtonBase
      onClick={onToggle}
      aria-pressed={selected}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0.75,
        minWidth: 180,
        p: 1.25,
        borderRadius: 1,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        textAlign: 'left',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {team.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {t('{{count}} staff', { count: team.staffCount })}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {healthStatusOrder
          .filter((status) => team.counts[status] > 0)
          .map((status) => {
            const { bg, color } = healthColor(theme, status);
            return (
              <Typography
                key={status}
                variant="caption"
                sx={{
                  px: 0.75,
                  borderRadius: 3,
                  bgcolor: bg,
                  color,
                  fontWeight: 600,
                  lineHeight: 1.8,
                }}
              >
                {t('{{count}} {{status}}', {
                  count: team.counts[status],
                  status: healthLabel(t, status),
                })}
              </Typography>
            );
          })}
      </Box>
      {/* The counts above already say it, so the bar is decoration */}
      {graded > 0 && (
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'divider',
          }}
        >
          {gradedStatuses
            .filter((status) => team.counts[status] > 0)
            .map((status) => (
              <Box
                key={status}
                sx={{
                  flex: team.counts[status],
                  bgcolor: healthColor(theme, status).color,
                }}
              />
            ))}
        </Box>
      )}
    </ButtonBase>
  );
};

/**
 * How each team in the results is doing, for supervisors with several teams.
 * Each card is a toggle for that team's filter.
 */
export const TeamSummary: React.FC = () => {
  const { t } = useTranslation();
  const { staffMembers, team, setTeam, filterRequired } =
    useMpdSupervisorReport();
  const { data } = useManagedStaffTeamsQuery();
  const teamCount = data?.managedStaffTeams.length ?? 0;
  const summary = useMemo(() => summarizeTeams(staffMembers), [staffMembers]);

  if (teamCount < 2 || filterRequired || summary.length === 0) {
    return null;
  }

  return (
    <Box component="section" aria-label={t('Teams')} sx={{ mb: 2 }}>
      <Typography
        variant="overline"
        component="h2"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        {t('Teams')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {summary.map((row) => (
          <TeamCard
            key={row.name}
            team={row}
            selected={team === row.name}
            onToggle={() => setTeam(team === row.name ? null : row.name)}
          />
        ))}
      </Box>
    </Box>
  );
};
