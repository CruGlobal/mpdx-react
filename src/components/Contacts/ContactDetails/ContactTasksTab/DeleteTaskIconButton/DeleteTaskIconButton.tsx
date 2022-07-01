import { DialogActions, IconButton, styled } from '@material-ui/core';
import React, { useState } from 'react';
import { DeletedItemIcon } from '../../../../common/DeleteItemIcon/DeleteItemIcon';
import { DeleteConfirmation } from '../../../../common/Modal/DeleteConfirmation/DeleteConfirmation';

const DeleteButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
}));

interface DeleteTaskIconButtonProps {
  accountListId: string;
  taskId: string;
}

export const DeleteTaskIconButton: React.FC<DeleteTaskIconButtonProps> = ({
  accountListId,
  taskId,
}) => {
  const [removeDialogOpen, handleRemoveDialog] = useState(false);

  return (
    <>
      <DeleteButton onClick={() => handleRemoveDialog(true)}>
        <DeletedItemIcon />
      </DeleteButton>
      <DeleteConfirmation
        deleteType="task"
        open={removeDialogOpen}
        onClickConfirm={() => {
          return true;
        }} // onDeleteTask
        onClickDecline={handleRemoveDialog}
        accountListId={accountListId}
        taskId={taskId}
      />
    </>
  );
};
