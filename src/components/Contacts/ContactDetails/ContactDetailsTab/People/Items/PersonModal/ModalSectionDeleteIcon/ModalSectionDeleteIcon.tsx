import React from 'react';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const ContactEditDeleteIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: 0,
  transform: 'translateY(-50%)',
  color: theme.palette.cruGrayMedium.main,
  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'all',
  },
}));

interface ModalSectionDeleteIconProps {
  handleClick?: () => void;
  disabled?: boolean;
}

export const ModalSectionDeleteIcon: React.FC<ModalSectionDeleteIconProps> = ({
  handleClick,
  disabled,
}) => {
  const { t } = useTranslation();
  return (
    <ContactEditDeleteIconButton
      onClick={handleClick}
      aria-label={t('Modal Section Delete Icon')}
      disabled={disabled ?? false}
    >
      <DeleteIcon />
    </ContactEditDeleteIconButton>
  );
};
