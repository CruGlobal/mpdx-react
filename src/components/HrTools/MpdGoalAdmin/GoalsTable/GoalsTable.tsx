import React, { useEffect, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { StaffGoalRow } from '../mockData';
import { GoalStatusEnum } from '../mpdGoalAdminHelpers';

interface GoalsTableProps {
  rows: StaffGoalRow[];
}

export const GoalsTable: React.FC<GoalsTableProps> = ({ rows }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { selectedRowIds, toggleRow, toggleRows, search, selectedCohortId } =
    useMpdGoalAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to the first page whenever the filter inputs change, so the user
  // isn't stranded on a now-out-of-range page. Keyed on the filter identity
  // (search + cohort) rather than `rows.length`, which misses a filter change
  // that swaps which rows match without changing how many do.
  useEffect(() => {
    setPage(0);
  }, [search, selectedCohortId]);

  const pageRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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
            <TableCell padding="checkbox" />
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
                  label={
                    row.goalStatus === GoalStatusEnum.Complete
                      ? t('Complete')
                      : t('Incomplete')
                  }
                  color={
                    row.goalStatus === GoalStatusEnum.Complete
                      ? 'success'
                      : 'warning'
                  }
                />
              </TableCell>
              <TableCell>{row.familyStatus}</TableCell>
              <TableCell>
                {row.coach ?? (
                  <Link component="button" type="button" underline="hover">
                    {t('Assign Coach')}
                  </Link>
                )}
              </TableCell>
              <TableCell>{row.coordinator}</TableCell>
              <TableCell>
                <Link component="button" type="button" underline="hover">
                  {t('View/Edit')}
                </Link>
              </TableCell>
              <TableCell padding="checkbox" align="right">
                <IconButton
                  size="small"
                  aria-label={t('Actions for {{name}}', { name: row.name })}
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
        page={page}
        onPageChange={(_event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage={t('Rows per page')}
      />
    </TableContainer>
  );
};
