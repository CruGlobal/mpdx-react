import React, { useEffect, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Link,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { AssignCoachModal } from '../AssignCoachModal/AssignCoachModal';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { mockCoaches } from '../mockData';
import {
  DEFAULT_ROWS_PER_PAGE,
  GoalStatusEnum,
  StaffGoalRow,
  familyStatusLabel,
  goalStatusLabel,
} from '../mpdGoalAdminHelpers';
import { CoordinatorsCell } from './CoordinatorsCell';

// Complete is ready to send and Sent is already done; only Incomplete needs action.
const goalStatusColor = (status: GoalStatusEnum) => {
  switch (status) {
    case GoalStatusEnum.Complete:
      return 'success';
    case GoalStatusEnum.Sent:
      return 'info';
    default:
      return 'warning';
  }
};

const GoalStatusChip: React.FC<{ status: GoalStatusEnum }> = ({ status }) => {
  const { t } = useTranslation();
  const color = goalStatusColor(status);
  return (
    <Chip
      size="small"
      variant="outlined"
      label={goalStatusLabel(status, t)}
      color={color}
      // palette.main is under WCAG AA at this size; dark keeps the hue readable.
      sx={(theme) => ({
        color: theme.palette[color].dark,
        borderColor: theme.palette[color].dark,
      })}
    />
  );
};

interface GoalsTableProps {
  rows: StaffGoalRow[];
}

export const GoalsTable: React.FC<GoalsTableProps> = ({ rows }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    selectedRowIds,
    toggleRow,
    toggleRows,
    search,
    selectedCohortId,
    assignCoach,
  } = useMpdGoalAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  // The staff row whose coach is being assigned; null when the modal is closed.
  const [coachRow, setCoachRow] = useState<StaffGoalRow | null>(null);

  // TODO(MPDX-9914): populate from the assignable-coaches query.
  const assignableCoaches = mockCoaches;

  // TODO(MPDX-9914): call the assignCoach mutation once the backend exists.
  const handleAssignCoach = (coachId: string) => {
    const coach = assignableCoaches.find((option) => option.id === coachId);
    if (!coach || !coachRow) {
      return;
    }
    assignCoach([coachRow.id], coach.name);
  };

  // Keyed on filter identity, not rows.length, which misses same-size changes.
  useEffect(() => {
    setPage(0);
  }, [search, selectedCohortId]);

  // Clamp so a shrinking `rows` can't leave `page` past the end.
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1),
  );

  const pageRows = rows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );
  const pageIds = pageRows.map((row) => row.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRowIds.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedRowIds.has(id));

  if (rows.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="text.secondary">{t('No goals found')}</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small" aria-label={t('MPD goals')}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected && !allOnPageSelected}
                onChange={() => toggleRows(pageIds)}
                inputProps={{ 'aria-label': t('Select all') }}
              />
            </TableCell>
            <TableCell>{t('Name')}</TableCell>
            <TableCell>{t('Ministry')}</TableCell>
            <TableCell>{t('Campus Division')}</TableCell>
            <TableCell>{t('MPD Goal')}</TableCell>
            <TableCell>{t('Goal Status')}</TableCell>
            <TableCell>{t('Family Status')}</TableCell>
            <TableCell>{t('Coach')}</TableCell>
            <TableCell>{t('Coordinator')}</TableCell>
            <TableCell>{t('Actions')}</TableCell>
            <TableCell padding="checkbox">
              <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
                {t('Row actions')}
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pageRows.map((row) => (
            <TableRow key={row.id} hover selected={selectedRowIds.has(row.id)}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRowIds.has(row.id)}
                  onChange={() => toggleRow(row.id)}
                  inputProps={{
                    'aria-label': t('Select {{name}}', { name: row.name }),
                  }}
                />
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.ministry}</TableCell>
              <TableCell>{row.geography}</TableCell>
              <TableCell>
                {/* No goal calculation yet — a $0.00 here would read as real. */}
                {row.mpdGoal === null
                  ? '—'
                  : currencyFormat(row.mpdGoal, 'USD', locale)}
              </TableCell>
              <TableCell>
                <GoalStatusChip status={row.goalStatus} />
              </TableCell>
              <TableCell>{familyStatusLabel(row.familyStatus, t)}</TableCell>
              <TableCell>
                {row.coach ?? (
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => setCoachRow(row)}
                  >
                    {t('Assign Coach')}
                  </Link>
                )}
              </TableCell>
              <TableCell>
                <CoordinatorsCell coordinators={row.coordinators} />
              </TableCell>
              <TableCell>
                {/* Disabled until wired up so assistive tech announces the
                    inert state instead of a dead control (MPDX-9696). */}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  disabled
                >
                  {t('View/Edit')}
                </Link>
              </TableCell>
              <TableCell padding="checkbox" align="right">
                {/* Disabled until wired up so assistive tech announces the
                    inert state instead of a dead control (MPDX-9696). */}
                <IconButton
                  size="small"
                  aria-label={t('Actions for {{name}}', { name: row.name })}
                  disabled
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={rows.length}
        page={safePage}
        onPageChange={(_event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage={t('Rows per page')}
      />
      {coachRow && (
        <AssignCoachModal
          subjectName={coachRow.name}
          coaches={assignableCoaches}
          handleAssignCoach={handleAssignCoach}
          handleClose={() => setCoachRow(null)}
        />
      )}
    </TableContainer>
  );
};
