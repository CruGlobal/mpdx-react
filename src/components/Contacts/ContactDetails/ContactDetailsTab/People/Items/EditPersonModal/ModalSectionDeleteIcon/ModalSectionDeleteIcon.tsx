import React from 'react';
import { IconButton, styled } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const ContactEditDeleteIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: 0,
  transform: 'translateY(-50%)',
  color: theme.palette.cruGrayMedium.main,
}));

interface ModalSectionDeleteIconProps {
  handleClick?: () => void;
}

export const ModalSectionDeleteIcon: React.FC<ModalSectionDeleteIconProps> = ({
  handleClick,
}) => {
  return (
    <ContactEditDeleteIconButton onClick={handleClick}>
      <DeleteIcon />
    </ContactEditDeleteIconButton>
  );
};
