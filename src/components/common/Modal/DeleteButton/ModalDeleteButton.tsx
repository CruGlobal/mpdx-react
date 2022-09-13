import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export const DeleteButton = styled(Button)(({ theme }) => ({
  fontWeight: 550,
  color: theme.palette.error.main,
}));

interface ModalDeleteButtonProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const ModalDeleteButton: React.FC<ModalDeleteButtonProps> = ({
  onClick,
  size,
}) => {
  const { t } = useTranslation();

  return (
    <DeleteButton
      onClick={onClick}
      size={size}
      variant="text"
      data-testid="modal-delete-button"
    >
      {t('Delete')}
    </DeleteButton>
  );
};
