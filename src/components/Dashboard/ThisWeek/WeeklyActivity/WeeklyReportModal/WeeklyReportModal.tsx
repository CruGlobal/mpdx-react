import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import Modal from '../../../../common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface WeeklyReportModalProps {
  open: boolean;
  onClose: () => void;
  activeStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export const WeeklyReportModal = ({
  open,
  onClose,
  activeStep,
  onPrev,
  onNext,
}: WeeklyReportModalProps) => {
  const { t } = useTranslation();
  const error = false;

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={onClose}>
      <DialogContent dividers>
        {error ? (
          <Typography>{t('Error!')}</Typography>
        ) : (
          <Typography>Step {activeStep}</Typography>
        )}
      </DialogContent>
      {!error && (
        <DialogActions
          sx={{
            justifyContent: activeStep === 1 ? 'flex-end' : 'space-between',
          }}
        >
          {activeStep >= 2 && (
            <CancelButton onClick={onPrev}>{t('Back')}</CancelButton>
          )}
          <SubmitButton onClick={activeStep < 8 ? onNext : handleSubmit}>
            {activeStep < 8 ? t('Next') : t('Submit')}
          </SubmitButton>
        </DialogActions>
      )}
    </Modal>
  );
};
