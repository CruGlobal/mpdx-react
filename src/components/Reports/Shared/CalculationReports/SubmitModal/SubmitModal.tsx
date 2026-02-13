import React from 'react';
import { ChevronRight } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { ApprovalProcess } from 'src/components/Reports/AdditionalSalaryRequest/SubmitModalAccordions/ApprovalProcess/ApprovalProcess';
import { TotalSalaryRequested } from 'src/components/Reports/AdditionalSalaryRequest/SubmitModalAccordions/TotalSalaryRequested/TotalSalaryRequested';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
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
  deadlineDate?: string;
  actionRequired?: boolean;
  additionalApproval?: boolean;
  splitCap?: boolean;
  disableSubmit?: boolean;
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
  deadlineDate,
  actionRequired,
  additionalApproval,
  splitCap,
  disableSubmit,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  // TODO: Not sure what text to display if date is null
  const formattedDeadlineDate = deadlineDate
    ? dateFormatShort(DateTime.fromISO(deadlineDate), locale)
    : null;

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
    formattedDeadlineDate,
  });

  const title = overrideTitle ?? defaultTitle;
  const contentTitle = overrideContent ?? defaultContentTitle;
  const contentText = overrideSubContent ?? defaultContentText;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={isError || splitCap ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>{contentTitle}</b>
            {contentText}
          </Box>
        </Alert>
        {additionalApproval && (
          <Box mt={2}>
            <TotalSalaryRequested />
            <Box sx={{ mt: 2 }}>
              <ApprovalProcess />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('GO BACK')}</b>
        </Button>
        {!splitCap && (
          <Button
            onClick={handleConfirm}
            color={isError ? 'error' : 'primary'}
            disabled={disableSubmit}
          >
            <b>
              {additionalApproval ? t('Submit For Approval') : cancelButtonText}
            </b>
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
