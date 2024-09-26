import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { DeletedItemIcon } from '../../../../common/DeleteItemIcon/DeleteItemIcon';
import { DeleteConfirmation } from '../../../../common/Modal/DeleteConfirmation/DeleteConfirmation';

const DeleteButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(1),
}));

interface DeleteTaskIconButtonProps {
  accountListId: string;
  taskId: string;
  onDeleteConfirm?: () => void;
  removeSelectedIds?: (id: string[]) => void;
}

export const DeleteTaskIconButton: React.FC<DeleteTaskIconButtonProps> = ({
  accountListId,
  taskId,
  onDeleteConfirm,
  removeSelectedIds,
}) => {
  const { t } = useTranslation();

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  return (
    <>
      <DeleteButton
        onClick={() => setRemoveDialogOpen(true)}
        data-testid={`DeleteIconButton-${taskId}`}
      >
        <DeletedItemIcon />
      </DeleteButton>
      <DeleteConfirmation
        deleteType={t('task')}
        open={removeDialogOpen}
        onClickConfirm={onDeleteConfirm} // onDeleteTask
        onClickDecline={setRemoveDialogOpen}
        accountListId={accountListId}
        taskId={taskId}
        removeSelectedIds={removeSelectedIds}
      />
    </>
  );
};
