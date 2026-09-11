import React from 'react';
import { ChevronRight } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApprovalProcess } from 'src/components/HrTools/AdditionalSalaryRequest/SubmitModalAccordions/ApprovalProcess/ApprovalProcess';
import { TotalSalaryRequested } from 'src/components/HrTools/AdditionalSalaryRequest/SubmitModalAccordions/TotalSalaryRequested/TotalSalaryRequested';
import { getModalText } from './getModalText';

interface SubmitModalProps {
  formTitle: string;
  handleClose: () => void;
  handleConfirm: () => void;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: React.ReactNode;
  isCancel?: boolean;
  isDiscard?: boolean;
  isDiscardEdit?: boolean;
  actionRequired?: boolean;
  additionalApproval?: boolean;
  splitAsr?: boolean;
  disableSubmit?: boolean;
  submitting?: boolean;
  geographicLocation?: string;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  formTitle,
  handleClose,
  handleConfirm,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
  isDiscard,
  isDiscardEdit,
  actionRequired,
  additionalApproval,
  splitAsr,
  disableSubmit,
  submitting,
  geographicLocation,
}) => {
  const { t } = useTranslation();

  const {
    title: defaultTitle,
    contentTitle: defaultContentTitle,
    contentText: defaultContentText,
    cancelButtonText,
    isError,
  } = getModalText({
    t,
    formTitle,
    isCancel: isCancel ?? false,
    isDiscard: isDiscard ?? false,
    isDiscardEdit: isDiscardEdit ?? false,
    actionRequired: actionRequired ?? false,
  });

  const title = overrideTitle ?? defaultTitle;
  const contentTitle = overrideContent ?? defaultContentTitle;
  const contentText = overrideSubContent ?? defaultContentText;

  return (
    <Dialog
      open={true}
      onClose={submitting ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={isError || splitAsr ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>{contentTitle}</b>
            {contentText}
          </Box>
        </Alert>
        {additionalApproval && !splitAsr && (
          <Box mt={2}>
            <TotalSalaryRequested />
            <Box sx={{ mt: 2 }}>
              <ApprovalProcess />
            </Box>
          </Box>
        )}
        {geographicLocation && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t(
              'Your geographic location will be updated to {{geographicLocation}} in your account settings.',
              { geographicLocation },
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: 'text.secondary' }}
        >
          <b>{t('GO BACK')}</b>
        </Button>
        {!splitAsr && (
          <Button
            onClick={handleConfirm}
            color={isError ? 'error' : 'primary'}
            disabled={disableSubmit || submitting}
            aria-busy={submitting}
            startIcon={
              submitting ? <CircularProgress size={20} color="inherit" /> : null
            }
            endIcon={<ChevronRight />}
          >
            <b>
              {additionalApproval ? t('Submit For Approval') : cancelButtonText}
            </b>
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
