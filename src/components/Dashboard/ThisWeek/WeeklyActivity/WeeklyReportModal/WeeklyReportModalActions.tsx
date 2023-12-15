import React from 'react';
import { DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface WeeklyReportActionsProps {
  questionsLength: number;
  activeStep: number;
  prevQuestion: () => void;
  save: () => void;
  value: string;
  isValid: boolean;
}

export const WeeklyReportActions = ({
  questionsLength,
  activeStep,
  prevQuestion,
  save,
  value,
  isValid,
}: WeeklyReportActionsProps) => {
  const { t } = useTranslation();
  return (
    <DialogActions
      sx={{
        justifyContent:
          activeStep === 1 || activeStep === questionsLength + 1
            ? 'flex-end'
            : 'space-between',
      }}
    >
      {activeStep > 1 && activeStep <= questionsLength && (
        <CancelButton
          onClick={() => {
            prevQuestion();
            if (value !== '') {
              save();
            }
          }}
        >
          {t('Back')}
        </CancelButton>
      )}
      <SubmitButton disabled={!isValid || (isValid && value === '')}>
        {activeStep < questionsLength ? t('Next') : t('Submit')}
      </SubmitButton>
    </DialogActions>
  );
};
