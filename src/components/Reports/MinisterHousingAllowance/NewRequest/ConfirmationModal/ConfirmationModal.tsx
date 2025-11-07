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
import { PageEnum } from '../../Shared/sharedTypes';

interface ConfirmationModalProps {
  type: PageEnum;
  handleClose: () => void;
  handleConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  type,
  handleClose,
  handleConfirm,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const deadlineDate = dateFormatShort(
    DateTime.fromISO(
      mocks[4].mhaDetails.staffMHA?.deadlineDate ?? DateTime.now().toISO(),
    ),
    locale,
  );

  const isEdit = type === PageEnum.Edit;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle id="confirmation-modal-title">
        {isEdit
          ? t('Are you ready to submit your updated MHA Request?')
          : t('Are you ready to submit your MHA Request?')}
      </DialogTitle>
      <DialogContent>
        <Alert severity={'warning'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>
              {isEdit
                ? t(
                    'You are submitting changes to your Annual MHA Request for board approval.',
                  )
                : t('You are submitting your MHA Request for board approval.')}
            </b>
            {isEdit
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
                )}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('Go Back')}</b>
        </Button>
        <Button onClick={handleConfirm} color="primary">
          <b>{t('Yes, Continue')}</b>
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
