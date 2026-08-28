import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { DEFAULT_ROWS_PER_PAGE } from '../mpdGoalAdminHelpers';
import {
  NewStaffScenarioGoalsQuery,
  useCreateNewStaffScenarioGoalMutation,
  useDeleteNewStaffScenarioGoalMutation,
  useNewStaffScenarioGoalsQuery,
} from './ScenarioGoals.generated';

type ScenarioGoalNode =
  NewStaffScenarioGoalsQuery['newStaffScenarioGoals']['nodes'][number];

// Scenario goals are hand-built drafts, so a name is optional until the form fills one in.
const scenarioGoalName = (node: ScenarioGoalNode): string =>
  [node.firstName, node.lastName].filter(Boolean).join(' ');

export const ScenarioGoals: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const accountListId = useAccountListId();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  // The scenario goal pending deletion; kept through the close transition so
  // the confirmation message doesn't flash empty while the dialog fades out.
  const [deleteTarget, setDeleteTarget] = useState<ScenarioGoalNode | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  // TODO(MPDX-9843): server-side search, sort, and paging; until then the
  // first 100 scenarios cover per-user usage and the table pages client-side.
  const { data, loading, error } = useNewStaffScenarioGoalsQuery();
  const [createScenarioGoal, { loading: creating }] =
    useCreateNewStaffScenarioGoalMutation();
  const [deleteScenarioGoal] = useDeleteNewStaffScenarioGoalMutation();

  const scenarioGoalUrl = (id: string) =>
    `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/scenario/${id}`;

  const handleCreate = async () => {
    try {
      const { data: createData } = await createScenarioGoal();
      const id =
        createData?.createNewStaffScenarioGoal?.newStaffGoalCalculation.id;
      if (id) {
        router.push(scenarioGoalUrl(id));
      }
    } catch {
      // The global Apollo error link toasts the failure.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteScenarioGoal({
      variables: { id: deleteTarget.id },
      update: (cache) => {
        cache.evict({ id: `NewStaffGoalCalculation:${deleteTarget.id}` });
        cache.gc();
      },
    });
  };

  const deleteTargetName = deleteTarget
    ? scenarioGoalName(deleteTarget) || t('this scenario goal')
    : '';

  const rows = data?.newStaffScenarioGoals.nodes ?? [];
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1),
  );
  const pageRows = rows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t(
            'Draft goal calculations that are not tied to a staff member. Use them to explore "what if" scenarios.',
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={
            creating ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          onClick={handleCreate}
          disabled={creating}
        >
          {t('New Scenario Goal')}
        </Button>
      </Box>

      {/* The scenario queries are creator-scoped, so a failure here is a real
          error rather than an empty list. */}
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress aria-label={t('Loading scenario goals')} />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            {t('No scenario goals yet. Create one to get started.')}
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small" aria-label={t('Scenario goals')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Name')}</TableCell>
                <TableCell>{t('Ministry')}</TableCell>
                <TableCell>{t('Campus Division')}</TableCell>
                <TableCell>{t('MPD Goal')}</TableCell>
                <TableCell>{t('Created')}</TableCell>
                <TableCell>{t('Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row) => {
                const name = scenarioGoalName(row) || t('Untitled scenario');
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={scenarioGoalUrl(row.id)}
                        underline="hover"
                      >
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.ministryName || '—'}</TableCell>
                    <TableCell>{row.geographicLocation || '—'}</TableCell>
                    <TableCell>
                      {currencyFormat(
                        row.calculations.monthlyGoal,
                        'USD',
                        locale,
                      )}
                    </TableCell>
                    <TableCell>
                      {dateFormatShort(DateTime.fromISO(row.createdAt), locale)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        aria-label={t('Delete {{name}}', { name })}
                        onClick={() => {
                          setDeleteTarget(row);
                          setDeleteOpen(true);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          {data?.newStaffScenarioGoals.pageInfo.hasNextPage && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', px: 2, pb: 1 }}
            >
              {t('Showing the first 100 scenario goals.')}
            </Typography>
          )}
        </TableContainer>
      )}

      <Confirmation
        isOpen={deleteOpen}
        title={t('Delete Scenario Goal')}
        message={t(
          'Are you sure you want to delete {{name}}? This cannot be undone.',
          { name: deleteTargetName },
        )}
        mutation={handleDelete}
        confirmButtonProps={{ variant: 'contained', color: 'error' }}
        handleClose={() => setDeleteOpen(false)}
      />
    </>
  );
};
