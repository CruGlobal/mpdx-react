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
import { PageEnum } from '../../Shared/sharedTypes';

interface CancelModalProps {
  type: PageEnum;
  handleClose: () => void;
  handleConfirm: () => void;
  isDelete?: boolean;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  type,
  handleClose,
  handleConfirm,
  isDelete,
}) => {
  const { t } = useTranslation();

  const isEdit = type === PageEnum.Edit;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle id="confirmation-modal-title">
        {isDelete
          ? t('Do you want to delete your MHA Request?')
          : isEdit
            ? t('Do you want to cancel these changes?')
            : t('Do you want to cancel?')}
      </DialogTitle>
      <DialogContent>
        <Alert severity={'error'}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <b>
              {isDelete
                ? t('You are deleting your MHA Request.')
                : isEdit
                  ? t('You are cancelling your changes to this form.')
                  : t('You are cancelling this MHA Request.')}
            </b>
            {isDelete
              ? t(
                  'It will no longer be considered for board review and your information entered in this form will not be saved.',
                )
              : isEdit
                ? t(
                    'Your work will not be saved and the board will review your request without these changes.',
                  )
                : t('Your work will not be saved.')}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <b>{t('Go Back')}</b>
        </Button>
        <Button onClick={handleConfirm} color="error">
          <b>{isDelete ? t('Yes, Delete') : t('Yes, Cancel')}</b>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
