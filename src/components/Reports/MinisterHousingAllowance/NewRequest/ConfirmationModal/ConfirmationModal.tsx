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
import { useTranslation } from 'react-i18next';
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
                  `Once submitted, you can return and make edits until {{date}}. After this date, your request will be locked for request will be processed as is.`,
                  { date: mocks[0].mhaDetails.staffMHA?.deadlineDate },
                )}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('Go Back')}</b>
        </Button>
        {isCancel ? (
          <Button onClick={handleConfirm} color="error">
            <b>{t('Yes, Cancel')}</b>
          </Button>
        ) : (
          <Button onClick={handleConfirm} color="primary">
            <b>{t('Yes, Continue')}</b>
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
