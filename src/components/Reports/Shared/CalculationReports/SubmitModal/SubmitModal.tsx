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
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';

interface SubmitModalProps {
  formTitle: string;
  handleClose: () => void;
  handleConfirm: () => void;
  overrideTitle?: string;
  overrideContent?: string;
  overrideSubContent?: string;
  isCancel?: boolean;
  deadlineDate?: string;
  actionRequired?: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  formTitle,
  handleClose,
  handleConfirm,
  overrideTitle,
  overrideContent,
  overrideSubContent,
  isCancel,
  deadlineDate,
  actionRequired,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  // TODO: Not sure what text to display if date is null
  const formattedDeadlineDate = deadlineDate
    ? dateFormatShort(DateTime.fromISO(deadlineDate), locale)
    : null;

  const title = overrideTitle
    ? overrideTitle
    : isCancel
      ? t(`Do you want to cancel your ${formTitle}?`)
      : actionRequired
        ? t(`Are you ready to submit your updated ${formTitle}?`)
        : t(`Are you ready to submit your ${formTitle}?`);

  const contentTitle = overrideContent
    ? overrideContent
    : isCancel
      ? t(`You are cancelling this ${formTitle}.`)
      : actionRequired
        ? t(
            `You are submitting changes to your Annual ${formTitle} for board approval.`,
          )
        : t(`You are submitting your ${formTitle} for board approval.`);

  const contentText = overrideSubContent
    ? overrideSubContent
    : isCancel
      ? t(
          'It will no longer be considered for board review and your information entered in this form will not be saved.',
        )
      : actionRequired
        ? t(
            'This updated request will take the place of your previous request. Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.',
            {
              date: formattedDeadlineDate,
              interpolation: { escapeValue: false },
            },
          )
        : t(
            `Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.`,
            {
              date: formattedDeadlineDate,
              interpolation: { escapeValue: false },
            },
          );

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={isCancel ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>{contentTitle}</b>
            {contentText}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('GO BACK')}</b>
        </Button>
        <Button onClick={handleConfirm} color={isCancel ? 'error' : 'primary'}>
          <b>{isCancel ? t('Yes, Cancel') : t('Yes, Continue')}</b>
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
