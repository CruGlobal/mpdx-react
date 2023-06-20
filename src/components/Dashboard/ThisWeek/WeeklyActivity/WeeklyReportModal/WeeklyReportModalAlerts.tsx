import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, DialogActions, DialogContent } from '@mui/material';
import { CancelButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface WeeklyReportAlertsProps {
  questionsLength: number;
  activeStep: number;
  onClose: () => void;
}

export const WeeklyReportAlerts = ({
  questionsLength,
  activeStep,
  onClose,
}: WeeklyReportAlertsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DialogContent dividers data-testid="WeeklyReportModalAlerts">
        {questionsLength === 0 && (
          <Alert severity="warning">
            {t(
              'Weekly report questions have not been setup for your organization.',
            )}
          </Alert>
        )}
        {questionsLength > 0 && activeStep === questionsLength + 1 && (
          <Alert severity="success">
            Your report was successfully submitted. View it on your coaching
            reports page.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClose}>{t('Close')}</CancelButton>
      </DialogActions>
    </>
  );
};
