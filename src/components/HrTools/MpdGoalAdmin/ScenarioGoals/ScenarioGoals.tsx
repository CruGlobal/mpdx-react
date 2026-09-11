import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
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
  Tooltip,
  Typography,
} from '@mui/material';
import { uniqBy } from 'lodash';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { isCalculationComplete } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/goalSettingsCompletion';
import { scenarioGoalSendBlockedReason } from 'src/components/HrTools/Shared/SendScenarioGoal/sendScenarioGoalHelpers';
import { useSendScenarioGoal } from 'src/components/HrTools/Shared/SendScenarioGoal/useSendScenarioGoal';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { StatusChip } from '../../Shared/StatusChip';
import { DEFAULT_ROWS_PER_PAGE, scenarioGoalUrl } from '../mpdGoalAdminHelpers';
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

  const { data, error, fetchMore } = useNewStaffScenarioGoalsQuery();
  const { loading } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.newStaffScenarioGoals.pageInfo,
  });
  const [createScenarioGoal, { loading: creating }] =
    useCreateNewStaffScenarioGoalMutation();
  const [deleteScenarioGoal] = useDeleteNewStaffScenarioGoalMutation();
  const { requestSend, confirmationProps: sendConfirmationProps } =
    useSendScenarioGoal();

  const handleCreate = async () => {
    try {
      const { data: createData } = await createScenarioGoal();
      const id =
        createData?.createNewStaffScenarioGoal?.newStaffGoalCalculation.id;
      if (id) {
        router.push(scenarioGoalUrl(accountListId, id));
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

  const rows = useMemo(
    () => uniqBy(data?.newStaffScenarioGoals.nodes ?? [], 'id'),
    [data?.newStaffScenarioGoals.nodes],
  );
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
        <Box>
          <Typography variant="h6">{t('Scenario MPD Goals')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              'Draft goal calculations that are not tied to a staff member. Use them to explore "what if" scenarios.',
            )}
          </Typography>
        </Box>
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
      ) : !!rows.length ? (
        <TableContainer>
          <Table size="small" aria-label={t('Scenario goals')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Name')}</TableCell>
                <TableCell>{t('Ministry')}</TableCell>
                <TableCell>{t('Campus Division')}</TableCell>
                <TableCell>{t('MPD Goal')}</TableCell>
                <TableCell>{t('Goal Status')}</TableCell>
                <TableCell>{t('Created')}</TableCell>
                <TableCell>{t('Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row) => {
                const name = scenarioGoalName(row) || t('Untitled scenario');
                const sendBlockedReason = scenarioGoalSendBlockedReason(row, t);
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={scenarioGoalUrl(accountListId, row.id)}
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
                      {isCalculationComplete(row) ? (
                        <StatusChip color="success" label={t('Complete')} />
                      ) : (
                        <StatusChip color="warning" label={t('Incomplete')} />
                      )}
                    </TableCell>
                    <TableCell>
                      {dateFormatShort(DateTime.fromISO(row.createdAt), locale)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={sendBlockedReason ?? ''}>
                        {/* The span is needed: a disabled button has neither mouse events nor a tab stop. */}
                        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the disabled child has no tab stop of its own */}
                        <span tabIndex={0}>
                          <IconButton
                            size="small"
                            aria-label={t('Email {{name}}', { name })}
                            disabled={Boolean(sendBlockedReason)}
                            onClick={() => requestSend(row)}
                          >
                            <MailOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
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
          {loading && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', px: 2, pb: 1 }}
              aria-live="polite"
            >
              {t('Loading more scenario goals…')}
            </Typography>
          )}
        </TableContainer>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress aria-label={t('Loading scenario goals')} />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            {t('No scenario goals yet. Create one to get started.')}
          </Typography>
        </Box>
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

      <Confirmation {...sendConfirmationProps} />
    </>
  );
};
