import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  DialogActions,
  DialogContent,
  LinearProgress,
  Typography,
} from '@mui/material';
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
  const setupError = false;

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={onClose}>
      <form>
        <DialogContent dividers>
          {setupError ? (
            <Alert severity="warning">
              {t(
                'Weekly report questions have not been setup for your organization.',
              )}
            </Alert>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(activeStep / 8) * 100}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >{`${activeStep}/8`}</Typography>
                </Box>
              </Box>
              <Box mt={1}>
                <Typography variant="h5">{`Question ${activeStep}`}</Typography>
                <Typography>Input field goes here.</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        {!setupError && (
          <DialogActions
            sx={{
              justifyContent: activeStep === 1 ? 'flex-end' : 'space-between',
            }}
          >
            {activeStep >= 2 && (
              <CancelButton onClick={onPrev}>{t('Back')}</CancelButton>
            )}
            <SubmitButton
              type={'button'} // TODO: change type to 'submit' on last screen
              onClick={activeStep < 8 ? onNext : handleSubmit}
            >
              {activeStep < 8 ? t('Next') : t('Submit')}
            </SubmitButton>
          </DialogActions>
        )}
      </form>
    </Modal>
  );
};
