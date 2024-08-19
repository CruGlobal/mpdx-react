import React from 'react';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CancelButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';

interface CsvImportSuccessModalProps {
  isOpen: boolean;
  message: string;
  handleClose: () => void;
}

export const CsvImportSuccessModal: React.FC<CsvImportSuccessModalProps> = ({
  isOpen,
  message,
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      title={t('Info')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent dividers>
        <DialogContentText component="div">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose}>{t('Ok')}</CancelButton>
      </DialogActions>
    </Modal>
  );
};
