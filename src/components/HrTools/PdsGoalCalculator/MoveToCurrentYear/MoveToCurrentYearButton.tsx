import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { usePdsSummaryData } from '../calculations/usePdsSummaryData';
import { useMovePdsGoalToCurrentYearMutation } from './MovePdsGoalToCurrentYear.generated';
import {
  CappedAmountField,
  buildCurrentYearCalculation,
  getCappedAmountChanges,
} from './moveToCurrentYear';

export const MoveToCurrentYearButton: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const {
    calculation,
    hcmUser,
    summaryData,
    constants,
    isMutating,
    trackMutation,
  } = usePdsGoalCalculator();
  const [movePdsGoalToCurrentYear, { loading: saving }] =
    useMovePdsGoalToCurrentYearMutation();
  const [open, setOpen] = useState(false);

  const currentYear = useMemo(() => DateTime.local().year, []);
  const currentYearConstants = useGoalCalculatorConstants(currentYear, {
    skip: !calculation,
  });

  const movedCalculation = useMemo(
    () =>
      calculation &&
      buildCurrentYearCalculation(
        calculation,
        currentYear,
        currentYearConstants.goalMiscConstants,
      ),
    [calculation, currentYear, currentYearConstants.goalMiscConstants],
  );
  const { data: movedSummaryData } = usePdsSummaryData(
    movedCalculation,
    hcmUser,
  );

  if (
    !calculation ||
    currentYearConstants.loading ||
    currentYearConstants.unavailable
  ) {
    return null;
  }

  const formatAmount = (amount: number) =>
    currencyFormat(amount, 'USD', locale, { showTrailingZeros: true });

  const fieldLabels: Record<CappedAmountField, string> = {
    ministryCellPhone: t('Ministry Cell Phone'),
    ministryInternet: t('Ministry Internet'),
  };
  const changes = getCappedAmountChanges(
    calculation,
    constants.goalMiscConstants,
    currentYearConstants.goalMiscConstants,
  );

  const location = calculation.geographicLocation;
  const locationMissing =
    !!location && !currentYearConstants.goalGeographicConstantMap.has(location);

  const handleMove = async () => {
    const { data } = await trackMutation(
      movePdsGoalToCurrentYear({ variables: { id: calculation.id } }),
    );
    if (data) {
      enqueueSnackbar(
        t('Goal updated to {{year}} rates.', { year: currentYear }),
        { variant: 'success' },
      );
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        color="inherit"
        size="small"
        onClick={() => setOpen(true)}
        disabled={isMutating}
      >
        {t('Update to {{year}} rates', { year: currentYear })}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="move-to-current-year-dialog-title"
      >
        <DialogTitle id="move-to-current-year-dialog-title">
          {t('Update to {{year}} rates', { year: currentYear })}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" gap={4} mb={2}>
            <div data-testid="old-year-total">
              <Typography variant="body2" color="text.secondary">
                {t('{{year}} rates', { year: calculation.calculationsYear })}
              </Typography>
              <Typography variant="h6">
                {summaryData ? formatAmount(summaryData.overallTotal) : '-'}
              </Typography>
            </div>
            <div data-testid="new-year-total">
              <Typography variant="body2" color="text.secondary">
                {t('{{year}} rates', { year: currentYear })}
              </Typography>
              <Typography variant="h6">
                {movedSummaryData
                  ? formatAmount(movedSummaryData.overallTotal)
                  : '-'}
              </Typography>
            </div>
          </Stack>
          {changes.length ? (
            <ul>
              {changes.map(({ field, amount, newMax, lowered }) => (
                <li key={field}>
                  <Typography variant="body2">
                    {lowered
                      ? t(
                          '{{field}} will be lowered from {{amount}} to {{max}} (the {{year}} max).',
                          {
                            field: fieldLabels[field],
                            amount: formatAmount(amount),
                            max: formatAmount(newMax),
                            year: currentYear,
                          },
                        )
                      : t(
                          '{{field}} stays at {{amount}}. The {{year}} max is now {{max}}.',
                          {
                            field: fieldLabels[field],
                            amount: formatAmount(amount),
                            max: formatAmount(newMax),
                            year: currentYear,
                          },
                        )}
                  </Typography>
                </li>
              ))}
            </ul>
          ) : (
            <DialogContentText mb={2}>
              {t('None of your entered amounts will change.')}
            </DialogContentText>
          )}
          {locationMissing && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t(
                '{{location}} is not a {{year}} location. After updating, choose a new location on the Setup step.',
                { location, year: currentYear },
              )}
            </Alert>
          )}
          <DialogContentText>
            {t('This change cannot be undone.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleMove}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {t('Update')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
