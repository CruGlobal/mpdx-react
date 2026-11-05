import React, { useEffect, useId, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, ButtonBase, Collapse, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { useManagedStaffQuery } from '../ManagedStaff.generated';
import { useManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import {
  filterRequiredFromError,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { healthStatusLabel } from '../ReportLegend/legendCopy';
import {
  TeamSummaryRow,
  healthColor,
  mergeSpouseRows,
  summarizeTeams,
  teamPickerNames,
} from '../helpers';

const gradedStatuses = [
  MpdHealthStatusEnum.Red,
  MpdHealthStatusEnum.Yellow,
  MpdHealthStatusEnum.Green,
];
const badgeStatuses = [
  ...gradedStatuses,
  MpdHealthStatusEnum.Blue,
  MpdHealthStatusEnum.Gray,
];

interface TeamCardProps {
  name: string;
  /** Omitted over the row cap, when there are no rows to count */
  team?: TeamSummaryRow;
  selected: boolean;
  onToggle: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  name,
  team,
  selected,
  onToggle,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const graded = team
    ? gradedStatuses.reduce((total, status) => total + team.counts[status], 0)
    : 0;

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
          {name}
        </Typography>
        {team && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('{{count}} staff', { count: team.staffCount })}
          </Typography>
        )}
      </Box>
      {team && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {badgeStatuses
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
                  {/* `total`, not `count`: the status word never changes with the number */}
                  {t('{{status}} ({{total}})', {
                    status: healthStatusLabel(t, status),
                    total: team.counts[status],
                  })}
                </Typography>
              );
            })}
        </Box>
      )}
      {/* The counts above already say it, so the bar is decoration */}
      {team && graded > 0 && (
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
 * How each team is doing, for supervisors with several teams. The cards come
 * from the report's other filters but never its team filter, so every team
 * stays comparable while one is selected; a card toggles that team's filter.
 * Over the API's row cap there are no rows to count, so the cards just name
 * the teams in the picked department, to make picking one a single click.
 */
export const TeamSummary: React.FC = () => {
  const { t } = useTranslation();
  const {
    queryVariables,
    team,
    setTeam,
    department,
    filterRequired,
    staffLoading,
  } = useMpdSupervisorReport();
  const {
    data: teamsData,
    error: teamsError,
    refetch: refetchTeams,
  } = useManagedStaffTeamsQuery();
  const teamCount = teamsData?.managedStaffTeams.length ?? 0;
  const cardsId = useId();
  const [open, setOpen] = useState(true);

  // Identical to the roster query while no team is selected, so Apollo serves
  // it from the same cache entry; with a team selected it is the one extra
  // request that keeps the other teams' counts whole.
  const { data, error, loading, fetchMore } = useManagedStaffQuery({
    context: { suppressErrorCodes: ['FILTER_REQUIRED'] },
    variables: { ...queryVariables, teamNames: null },
    skip: teamCount < 2 || (!!filterRequired && !staffLoading),
  });
  const pageInfo = data?.managedStaff.pageInfo;
  // Every page must be in before the counts mean anything. A page that fails
  // just hides the strip; the list's own alert reports the failure.
  const [pageError, setPageError] = useState<ApolloError | undefined>();
  useEffect(() => {
    setPageError(undefined);
  }, [queryVariables]);
  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor && !pageError) {
      fetchMore({ variables: { after: pageInfo.endCursor } }).catch(
        (fetchError: ApolloError) => setPageError(fetchError),
      );
    }
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, pageError, fetchMore]);
  const loadingPages = !!pageInfo?.hasNextPage;
  const summary = useMemo(
    () => summarizeTeams(mergeSpouseRows(data?.managedStaff.nodes ?? [])),
    [data],
  );

  if (teamsError && !teamsData) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 2 }}
        action={
          <ButtonBase
            onClick={() => {
              refetchTeams().catch(() => undefined);
            }}
            sx={{ px: 1, fontWeight: 600 }}
          >
            {t('Retry')}
          </ButtonBase>
        }
      >
        {t('Could not load your teams: {{message}}', {
          message: teamsError.message,
        })}
      </Alert>
    );
  }

  // The unfiltered reach can trip the row cap while the team-filtered list
  // fits. Either way there are no rows to count, so the cards only name the
  // teams to pick from.
  const overRowCap = !!filterRequired || !!filterRequiredFromError(error);
  const pickerNames = teamPickerNames(teamsData?.managedStaffTeams, department);
  const cards = overRowCap
    ? pickerNames.map((name) => ({ name, row: undefined }))
    : summary.map((row) => ({ name: row.name, row }));

  if (
    overRowCap
      ? cards.length === 0
      : teamCount < 2 || !data || loadingPages || pageError || !cards.length
  ) {
    return null;
  }
  // The picker's names never wait on the rows
  const busy = loading && !overRowCap;

  return (
    <Box
      component="section"
      aria-label={t('Teams')}
      aria-busy={busy}
      sx={{
        mb: 2,
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 150ms',
      }}
    >
      <Typography
        variant="overline"
        component="h2"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        <ButtonBase
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={cardsId}
          sx={{ font: 'inherit', gap: 0.5, borderRadius: 1 }}
        >
          {t('Teams ({{total}})', { total: cards.length })}
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transition: 'transform 150ms',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        </ButtonBase>
      </Typography>
      <Collapse in={open} id={cardsId}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {cards.map(({ name, row }) => (
            <TeamCard
              key={name}
              name={name}
              team={row}
              selected={team === name}
              onToggle={() => setTeam(team === name ? null : name)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
