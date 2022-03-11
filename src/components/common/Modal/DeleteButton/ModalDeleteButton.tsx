import React from 'react';
import { Button, styled } from '@material-ui/core';
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
    <DeleteButton onClick={onClick} size={size} variant="text">
      {t('Delete')}
    </DeleteButton>
  );
};
