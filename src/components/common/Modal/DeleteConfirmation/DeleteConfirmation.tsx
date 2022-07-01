import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 550,
}));

interface DeleteConfirmationProps {
  deleteType: string;
  open: boolean;
  deleting: boolean;
  onClickDecline: (decline: boolean) => void;
  onClickConfirm: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  deleteType,
  open,
  deleting,
  onClickConfirm,
  onClickDecline,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      aria-labelledby={t(`Remove ${deleteType} confirmation`)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t('Confirm')}</DialogTitle>
      <DialogContent dividers>
        {deleting ? (
          <LoadingIndicator color="primary" size={50} />
        ) : (
          <DialogContentText>
            {t('Are you sure you wish to delete the selected {{deleteType}}?', {
              deleteType,
            })}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <ActionButton onClick={() => onClickDecline(false)}>
          {t('No')}
        </ActionButton>
        <ActionButton onClick={onClickConfirm}>{t('Yes')}</ActionButton>
      </DialogActions>
    </Dialog>
  );
};
