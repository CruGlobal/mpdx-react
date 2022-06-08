import { IconButton, styled } from '@material-ui/core';
import React from 'react';
import { DeletedItemIcon } from '../../../../common/DeleteItemIcon/DeleteItemIcon';

const DeleteButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const DeleteTaskIconButton: React.FC = () => {
  return (
    <DeleteButton>
      <DeletedItemIcon />
    </DeleteButton>
  );
};
