import { DialogActions, IconButton, styled } from '@material-ui/core';
import React from 'react';
import { DeletedItemIcon } from '../../../../common/DeleteItemIcon/DeleteItemIcon';
import useTaskModal from '../../../../../hooks/useTaskModal';

const DeleteButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
}));

export const DeleteTaskIconButton: React.FC = () => {
  const { openTaskModal } = useTaskModal();

  return (
    <DeleteButton onClick={() => openTaskModal({ view: 'delete' })}>
      <DeletedItemIcon />
    </DeleteButton>
  );
};
