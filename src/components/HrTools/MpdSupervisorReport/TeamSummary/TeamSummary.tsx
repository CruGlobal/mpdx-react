import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, ButtonBase, Collapse, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { omit } from 'lodash';
import { useTranslation } from 'react-i18next';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { useManagedStaffTeamSummaryQuery } from '../ManagedStaffTeamSummary.generated';
import { useManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import {
  filterRequiredFromError,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { healthStatusLabel } from '../ReportLegend/legendCopy';
import {
  TeamSummaryRow,
  fitsTeamPicker,
  healthColor,
  teamPickerNames,
  teamSummaryRows,
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

// Two rows of cards plus a sliver of a third, so the cut shows there is more.
// Match these to the card heights when the cards change.
const countedCardsMaxHeight = 200;
const nameOnlyCardsMaxHeight = 110;

interface TeamCardProps {
  name: string;
  /** Omitted when the reach is too large for the API to count */
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
 * How each team is doing, for supervisors with several teams. The counts come
 * from the report's other filters but never its team filter, so every team
 * stays comparable while one is selected; a card toggles that team's filter.
 * When the reach is too large for the API to count, the cards just name the
 * teams in the picked department, to make picking one a single click.
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

  const summaryVariables = useMemo(
    () => omit(queryVariables, ['first', 'after', 'teamNames']),
    [queryVariables],
  );
  const { data, error, loading } = useManagedStaffTeamSummaryQuery({
    context: { suppressErrorCodes: ['FILTER_REQUIRED'] },
    variables: summaryVariables,
    skip: teamCount < 2,
  });
  const summary = useMemo(
    () => teamSummaryRows(data?.managedStaffTeamSummary ?? []),
    [data],
  );
  // Apollo clears the error while new filters load, so keep the last answer
  // until the API says whether the reach is still too large to count.
  const settledTooManyToCount = !!filterRequiredFromError(error);
  const [lastTooManyToCount, setLastTooManyToCount] = useState(false);
  useEffect(() => {
    if (!loading) {
      setLastTooManyToCount(settledTooManyToCount);
    }
  }, [loading, settledTooManyToCount]);
  const tooManyToCount = loading ? lastTooManyToCount : settledTooManyToCount;

  // Only a roster without a team says whether the reach trips the row cap, so
  // a picked team keeps the last answer.
  const [reachOverRowCap, setReachOverRowCap] = useState(false);
  useEffect(() => {
    if (!team && !staffLoading) {
      setReachOverRowCap(!!filterRequired);
    }
  }, [team, staffLoading, filterRequired]);
  const overRowCap = !!filterRequired || (!!team && reachOverRowCap);

  const cards: Array<{ name: string; row?: TeamSummaryRow }> = tooManyToCount
    ? teamPickerNames(teamsData?.managedStaffTeams, department).map((name) => ({
        name,
      }))
    : summary.map((row) => ({ name: row.name, row }));

  // Scroll only the cards box: the page around it must not move
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardOrder = cards.map(({ name }) => name).join('\n');
  useEffect(() => {
    const box = cardsRef.current;
    const picked = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!box || !picked) {
      return;
    }
    const top = picked.offsetTop;
    const bottom = top + picked.offsetHeight;
    if (top < box.scrollTop) {
      box.scrollTop = top;
    } else if (bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = bottom - box.clientHeight;
    }
  }, [team, cardOrder]);

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

  // Over the row cap the cards are how a team gets picked, so they follow the
  // picker's limits; under it they show every team in the results.
  if (
    tooManyToCount
      ? cards.length === 0
      : teamCount < 2 ||
        !data ||
        (overRowCap ? !fitsTeamPicker(cards.length) : !cards.length)
  ) {
    return null;
  }
  const busy = loading && !tooManyToCount;

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
        <Box
          ref={cardsRef}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            // The offset parent, so a card's offsetTop is within the box
            position: 'relative',
            maxHeight: tooManyToCount
              ? nameOnlyCardsMaxHeight
              : countedCardsMaxHeight,
            overflowY: 'auto',
          }}
        >
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
