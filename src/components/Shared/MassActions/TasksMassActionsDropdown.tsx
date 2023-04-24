import React, { ReactElement, useState } from 'react';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Hidden, ListItemText, Menu, MenuItem } from '@mui/material';
import { dispatch } from 'src/lib/analytics';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { ResultEnum } from '../../../../graphql/types.generated';
import { MassActionsTasksConfirmationModal } from 'src/components/Task/MassActions/ConfirmationModal/MassActionsTasksConfirmationModal';
import { MassActionsEditTasksModal } from 'src/components/Task/MassActions/EditTasks/MassActionsEditTasksModal';
import { MassActionsTasksRemoveTagsModal } from 'src/components/Task/MassActions/RemoveTags/MassActionsTasksRemoveTagsModal';
import { MassActionsTasksAddTagsModal } from 'src/components/Task/MassActions/AddTags/MassActionsTasksAddTagsModal';
import {
  useMassActionsDeleteTasksMutation,
  useMassActionsUpdateTasksMutation,
} from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { MassActionsDropdown } from './MassActionsDropdown';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';

interface TasksMassActionsDropdownProps {
  buttonGroup?: ReactElement | null;
  selectedIdCount: number;
  massDeselectAll?: () => void;
  selectedIds: string[];
}

export const TasksMassActionsDropdown: React.FC<
  TasksMassActionsDropdownProps
> = ({ buttonGroup, selectedIdCount, massDeselectAll, selectedIds }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() ?? '';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [completeTasksModalOpen, setCompleteTasksModalOpen] = useState(false);
  const [addTagsModalOpen, setAddTagsModalOpen] = useState(false);
  const [deleteTasksModalOpen, setDeleteTasksModalOpen] = useState(false);
  const [editTasksModalOpen, setEditTasksModalOpen] = useState(false);
  const [removeTagsModalOpen, setRemoveTagsModalOpen] = useState(false);

  const [updateTasksMutation] = useMassActionsUpdateTasksMutation();
  const [deleteTasksMutation] = useMassActionsDeleteTasksMutation();
  const { update } = useUpdateTasksQueries();

  const completeTasks = async () => {
    const completedAt = DateTime.local().toISO();
    await updateTasksMutation({
      variables: {
        accountListId: accountListId ?? '',
        attributes: selectedIds.map((id) => ({
          id,
          completedAt,
          result: ResultEnum.Done,
        })),
      },
      refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
    });
    update();
    selectedIds.forEach(() => {
      dispatch('mpdx-task-completed');
    });
    enqueueSnackbar(t('Task(s) completed successfully'), {
      variant: 'success',
    });
    setCompleteTasksModalOpen(false);
    if (massDeselectAll) massDeselectAll();
  };

  const deleteTasks = async () => {
    await deleteTasksMutation({
      variables: {
        accountListId: accountListId ?? '',
        ids: selectedIds,
      },
      update: (cache) => {
        selectedIds.forEach((id) => {
          cache.evict({ id: `Task:${id}` });
        });
        cache.gc();
      },
      refetchQueries: ['GetWeeklyActivity', 'GetThisWeek'],
    });
    enqueueSnackbar(t('Task(s) deleted successfully'), {
      variant: 'success',
    });
    setDeleteTasksModalOpen(false);
    if (massDeselectAll) massDeselectAll();
  };

  return (
    <>
      {buttonGroup}
      <Hidden xsDown>
        {selectedIds?.length > 0 && (
          <>
            <MassActionsDropdown
              handleClick={handleClick}
              open={open}
              disabled={selectedIds.length === 0}
            >
              {t('Actions')}
            </MassActionsDropdown>
            <Menu
              open={open}
              onClose={handleClose}
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <MenuItem
                onClick={() => {
                  setCompleteTasksModalOpen(true);
                  handleClose();
                }}
              >
                <ListItemText>{t('Complete Tasks')}</ListItemText>
              </MenuItem>

              <MenuItem
                divider
                onClick={() => {
                  setEditTasksModalOpen(true);
                  handleClose();
                }}
              >
                <ListItemText>{t('Edit Tasks')}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAddTagsModalOpen(true);
                  handleClose();
                }}
              >
                <ListItemText>{t('Add Tag(s)')}</ListItemText>
              </MenuItem>

              <MenuItem
                divider
                onClick={() => {
                  setRemoveTagsModalOpen(true);
                  handleClose();
                }}
              >
                <ListItemText>{t('Remove Tag(s)')}</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setDeleteTasksModalOpen(true);
                  handleClose();
                }}
              >
                <ListItemText>{t('Delete Tasks')}</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Hidden>

      {completeTasksModalOpen && (
        <MassActionsTasksConfirmationModal
          open={completeTasksModalOpen}
          action="complete"
          idsCount={selectedIds.length}
          setOpen={setCompleteTasksModalOpen}
          onConfirm={completeTasks}
        />
      )}
      {addTagsModalOpen && (
        <MassActionsTasksAddTagsModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setAddTagsModalOpen(false)}
        />
      )}
      {deleteTasksModalOpen && (
        <MassActionsTasksConfirmationModal
          open={deleteTasksModalOpen}
          action="delete"
          idsCount={selectedIds.length}
          setOpen={setDeleteTasksModalOpen}
          onConfirm={deleteTasks}
        />
      )}
      {editTasksModalOpen && (
        <MassActionsEditTasksModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setEditTasksModalOpen(false)}
        />
      )}
      {removeTagsModalOpen && (
        <MassActionsTasksRemoveTagsModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setRemoveTagsModalOpen(false)}
        />
      )}
    </>
  );
};
