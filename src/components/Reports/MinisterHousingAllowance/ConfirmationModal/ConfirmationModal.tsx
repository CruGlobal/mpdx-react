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
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { mocks } from '../Shared/mockData';
import { PageEnum } from '../Shared/sharedTypes';

interface ConfirmationModalProps {
  handleClose: () => void;
  handleConfirm: () => void;
  isCancel?: boolean;
  isRequestingChange?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  handleClose,
  handleConfirm,
  isCancel,
  isRequestingChange,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { pageType } = useMinisterHousingAllowance();

  // TODO: Not sure what text to display if date is null
  const date = mocks[4].mhaDetails.staffMHA?.deadlineDate;
  const deadlineDate = date
    ? dateFormatShort(DateTime.fromISO(date), locale)
    : null;

  const actionRequired = pageType === PageEnum.Edit;

  const title = isRequestingChange
    ? t('Are you sure you want to change selection?')
    : isCancel
      ? t('Do you want to cancel?')
      : actionRequired
        ? t('Are you ready to submit your updated MHA Request?')
        : t('Are you ready to submit your MHA Request?');

  const contentTitle = isRequestingChange
    ? t('You are changing your MHA Request selection.')
    : isCancel
      ? t('You are cancelling this MHA Request.')
      : actionRequired
        ? t(
            'You are submitting changes to your Annual MHA Request for board approval.',
          )
        : t('You are submitting your MHA Request for board approval.');

  const contentText = isRequestingChange
    ? t(
        'Clicking "Yes, Continue" will wipe all inputs you\'ve entered previously. Are you sure you want to continue?',
      )
    : isCancel
      ? t(
          'All information associated with this request will be lost. This action cannot be undone.',
        )
      : actionRequired
        ? t(
            'This updated request will take the place of your previous request. Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.',
            {
              date: deadlineDate,
              interpolation: { escapeValue: false },
            },
          )
        : t(
            `Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.`,
            {
              date: deadlineDate,
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
          <b>{isCancel || isRequestingChange ? t('NO') : t('GO BACK')}</b>
        </Button>
        <Button onClick={handleConfirm} color={isCancel ? 'error' : 'primary'}>
          <b>{isCancel ? t('Yes, Cancel') : t('Yes, Continue')}</b>
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
