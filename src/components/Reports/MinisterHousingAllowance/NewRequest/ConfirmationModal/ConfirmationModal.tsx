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
import { mocks } from '../../Shared/mockData';

interface ConfirmationModalProps {
  handleClose: () => void;
  handleConfirm: () => void;
  isCancel?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  handleClose,
  handleConfirm,
  isCancel,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const deadlineDate = dateFormatShort(
    DateTime.fromISO(
      mocks[4].mhaDetails.staffMHA?.deadlineDate ?? DateTime.now().toISO(),
    ),
    locale,
  );

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle id="confirmation-modal-title">
        {isCancel
          ? t('Do you want to cancel?')
          : t('Are you ready to submit your MHA request?')}
      </DialogTitle>
      <DialogContent>
        <Alert severity={isCancel ? 'error' : 'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>
              {isCancel
                ? t('You are cancelling this MHA Request.')
                : t('You are submitting your MHA Request for board approval.')}
            </b>
            {isCancel
              ? t('Your work will not be saved.')
              : t(
                  `Once submitted, you can return and make edits until {{date}}. After this date, your request will be processed as is.`,
                  {
                    date: deadlineDate,
                    interpolation: { escapeValue: false },
                  },
                )}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        {isCancel ? (
          <>
            <Button
              onClick={handleClose}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              {t('No')}
            </Button>
            <Button
              onClick={handleConfirm}
              color="error"
              sx={{ fontWeight: 'bold' }}
            >
              {t('Yes, Cancel')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              {t('GO BACK')}
            </Button>
            <Button
              onClick={handleConfirm}
              color="primary"
              sx={{ fontWeight: 'bold' }}
            >
              {t('Yes, Continue')}
              <ChevronRight sx={{ ml: 1 }} />
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
