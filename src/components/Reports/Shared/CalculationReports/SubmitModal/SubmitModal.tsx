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
import { TotalAnnualSalaryAccordion } from 'src/components/Reports/AdditionalSalaryRequest/SubmitModalComponents/TotalAnnualSalaryAccordion/TotalAnnualSalaryAccordion';
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
  exceedsCap?: boolean;
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
  exceedsCap,
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
        <Alert severity={isError ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>{contentTitle}</b>
            {contentText}
          </Box>
        </Alert>
        {exceedsCap && (
          <Box mt={2}>
            <TotalAnnualSalaryAccordion />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('GO BACK')}</b>
        </Button>
        <Button onClick={handleConfirm} color={isError ? 'error' : 'primary'}>
          <b>{cancelButtonText}</b>
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
