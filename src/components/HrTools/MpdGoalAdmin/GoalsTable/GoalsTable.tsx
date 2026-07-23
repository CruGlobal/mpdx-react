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
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  AssignCoachModal,
  AssignCoachOption,
} from '../AssignCoachModal/AssignCoachModal';
import {
  DynamicImpersonateStaffModal,
  preloadImpersonateStaffModal,
} from '../ImpersonateStaffModal/DynamicImpersonateStaffModal';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { StaffGoalRow, isSendable } from '../mpdGoalAdminHelpers';

interface GoalsTableProps {
  rows: StaffGoalRow[];
}

export const DEFAULT_ROWS_PER_PAGE = 5;

export const GoalsTable: React.FC<GoalsTableProps> = ({ rows }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { admin, coach, impersonating } = useRequiredSession();
  const { selectedRowIds, toggleRow, toggleRows, search, selectedCohortId } =
    useMpdGoalAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  // The staff row whose coach is being assigned; null when the modal is closed.
  const [coachRow, setCoachRow] = useState<StaffGoalRow | null>(null);
  // The staff row being impersonated; null when the modal is closed.
  const [impersonateRow, setImpersonateRow] = useState<StaffGoalRow | null>(
    null,
  );

  // Hide the action mid-impersonation to avoid offering nested impersonation;
  // the server independently enforces the authorization.
  const canImpersonate = (admin || coach) && !impersonating;

  // TODO(MPDX-9699): populate from the assignable-coaches query once the
  // backend field exists. Empty for now so the modal renders a UI-only dropdown.
  const assignableCoaches: AssignCoachOption[] = [];

  const handleAssignCoach = async (_coachId: string) => {
    // TODO(MPDX-9699): call the assign-coach mutation with { staffId, coachId }
    // and refresh the goal-admin rows. Backend contract pending.
  };

  // Reset to the first page whenever the filter inputs change, so the user
  // isn't stranded on a now-out-of-range page. Keyed on the filter identity
  // (search + cohort) rather than `rows.length`, which misses a filter change
  // that swaps which rows match without changing how many do.
  useEffect(() => {
    setPage(0);
  }, [search, selectedCohortId]);

  // Clamp on render so a shrinking `rows` (refetch, optimistic removal) can't
  // leave `page` pointing past the end and render a blank table. The reset
  // effect above still handles the jump-to-page-1 UX on filter changes.
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
                {currencyFormat(row.mpdGoal, 'USD', locale)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={isSendable(row) ? t('Complete') : t('Incomplete')}
                  color={isSendable(row) ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell>{row.familyStatus}</TableCell>
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
              <TableCell>{row.coordinator}</TableCell>
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
                {canImpersonate && (
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onMouseEnter={preloadImpersonateStaffModal}
                    onClick={() => setImpersonateRow(row)}
                    sx={{ ml: 1 }}
                  >
                    {t('Impersonate')}
                  </Link>
                )}
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
      {impersonateRow && (
        <DynamicImpersonateStaffModal
          staffName={impersonateRow.name}
          staffEmail={impersonateRow.email}
          handleClose={() => setImpersonateRow(null)}
        />
      )}
    </TableContainer>
  );
};
