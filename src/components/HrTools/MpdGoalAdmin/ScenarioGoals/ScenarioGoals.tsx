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
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { DEFAULT_ROWS_PER_PAGE } from '../GoalsTable/GoalsTable';
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
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  // The scenario goal pending deletion; null when the confirmation is closed.
  const [deleteTarget, setDeleteTarget] = useState<ScenarioGoalNode | null>(
    null,
  );

  // Server-side search, sort, and paging land with MPDX-9843; until then the
  // first 100 scenarios cover per-user usage and the table pages client-side.
  const { data, loading, error, refetch } = useNewStaffScenarioGoalsQuery();
  const [createScenarioGoal, { loading: creating }] =
    useCreateNewStaffScenarioGoalMutation();
  const [deleteScenarioGoal] = useDeleteNewStaffScenarioGoalMutation();

  const scenarioGoalUrl = (id: string) =>
    `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/scenario/${id}`;

  const handleCreate = async () => {
    const { data } = await createScenarioGoal({
      onError: () => {
        enqueueSnackbar(t('Unable to create a scenario goal.'), {
          variant: 'error',
        });
      },
    });
    const id = data?.createNewStaffScenarioGoal?.newStaffGoalCalculation.id;
    if (id) {
      router.push(scenarioGoalUrl(id));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteScenarioGoal({
      variables: { id: deleteTarget.id },
      onError: () => {
        enqueueSnackbar(t('Unable to delete the scenario goal.'), {
          variant: 'error',
        });
      },
    });
    await refetch();
  };

  const deleteTargetName = deleteTarget
    ? scenarioGoalName(deleteTarget) || t('this scenario goal')
    : '';

  const rows = data?.newStaffScenarioGoals.nodes ?? [];
  const safePage = Math.min(page, Math.ceil(rows.length / rowsPerPage) - 1);
  const pageRows = rows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">{t('Scenario Goals')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              'Draft goal calculations that are not tied to a staff member. Use them to explore "what if" scenarios.',
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
      ) : loading ? (
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
                      <Link href={scenarioGoalUrl(row.id)} underline="hover">
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.ministryName}</TableCell>
                    <TableCell>{row.geographicLocation}</TableCell>
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
                        onClick={() => setDeleteTarget(row)}
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
          />
        </TableContainer>
      )}

      <Confirmation
        isOpen={deleteTarget !== null}
        title={t('Delete Scenario Goal')}
        message={t(
          'Are you sure you want to delete {{name}}? This cannot be undone.',
          { name: deleteTargetName },
        )}
        mutation={handleDelete}
        handleClose={() => setDeleteTarget(null)}
      />
    </>
  );
};
