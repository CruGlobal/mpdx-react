import React from 'react';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/Shared/Modal/Modal';

interface SetLocationModalProps {
  handleClose: () => void;
}

export const SetLocationModal: React.FC<SetLocationModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen title={t('Set Your Location')} handleClose={handleClose}>
      <DialogContent>Placeholder</DialogContent>
    </Modal>
  );
};
