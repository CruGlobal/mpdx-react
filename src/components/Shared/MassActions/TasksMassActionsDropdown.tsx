import React, { ReactElement, useState } from 'react';
import { Hidden, ListItemText, Menu, MenuItem } from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  DynamicMassActionsTasksAddTagsModal,
  preloadMassActionsTasksAddTagsModal,
} from 'src/components/Task/MassActions/AddTags/DynamicMassActionsTasksAddTagsModal';
import {
  DynamicMassActionsTasksConfirmationModal,
  preloadMassActionsTasksConfirmationModal,
} from 'src/components/Task/MassActions/ConfirmationModal/DynamicMassActionsTasksConfirmationModal';
import {
  DynamicMassActionsEditTasksModal,
  preloadMassActionsEditTasksModal,
} from 'src/components/Task/MassActions/EditTasks/DynamicMassActionsEditTasksModal';
import {
  useMassActionsDeleteTasksMutation,
  useMassActionsUpdateTasksMutation,
} from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import {
  DynamicMassActionsTasksRemoveTagsModal,
  preloadMassActionsTasksRemoveTagsModal,
} from 'src/components/Task/MassActions/RemoveTags/DynamicMassActionsTasksRemoveTagsModal';
import { ResultEnum } from 'src/graphql/types.generated';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { Action } from '../../Task/MassActions/ConfirmationModal/MassActionsTasksConfirmationModal';
import { MassActionsDropdown } from './MassActionsDropdown';

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
          result: ResultEnum.Completed,
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
    if (massDeselectAll) {
      massDeselectAll();
    }
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
    if (massDeselectAll) {
      massDeselectAll();
    }
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
              disableRestoreFocus={true}
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <MenuItem
                onClick={() => {
                  setCompleteTasksModalOpen(true);
                  handleClose();
                }}
                onMouseEnter={preloadMassActionsTasksConfirmationModal}
              >
                <ListItemText>{t('Complete Tasks')}</ListItemText>
              </MenuItem>

              <MenuItem
                divider
                onClick={() => {
                  setEditTasksModalOpen(true);
                  handleClose();
                }}
                onMouseEnter={preloadMassActionsEditTasksModal}
              >
                <ListItemText>{t('Edit Tasks')}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAddTagsModalOpen(true);
                  handleClose();
                }}
                onMouseEnter={preloadMassActionsTasksAddTagsModal}
              >
                <ListItemText>{t('Add Tag(s)')}</ListItemText>
              </MenuItem>

              <MenuItem
                divider
                onClick={() => {
                  setRemoveTagsModalOpen(true);
                  handleClose();
                }}
                onMouseEnter={preloadMassActionsTasksRemoveTagsModal}
              >
                <ListItemText>{t('Remove Tag(s)')}</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setDeleteTasksModalOpen(true);
                  handleClose();
                }}
                onMouseEnter={preloadMassActionsTasksConfirmationModal}
              >
                <ListItemText>{t('Delete Tasks')}</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Hidden>

      {completeTasksModalOpen && (
        <DynamicMassActionsTasksConfirmationModal
          open={completeTasksModalOpen}
          action={Action.Complete}
          idsCount={selectedIds.length}
          setOpen={setCompleteTasksModalOpen}
          onConfirm={completeTasks}
        />
      )}
      {addTagsModalOpen && (
        <DynamicMassActionsTasksAddTagsModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setAddTagsModalOpen(false)}
        />
      )}
      {deleteTasksModalOpen && (
        <DynamicMassActionsTasksConfirmationModal
          open={deleteTasksModalOpen}
          action={Action.Delete}
          idsCount={selectedIds.length}
          setOpen={setDeleteTasksModalOpen}
          onConfirm={deleteTasks}
        />
      )}
      {editTasksModalOpen && (
        <DynamicMassActionsEditTasksModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setEditTasksModalOpen(false)}
        />
      )}
      {removeTagsModalOpen && (
        <DynamicMassActionsTasksRemoveTagsModal
          ids={selectedIds}
          selectedIdCount={selectedIdCount}
          accountListId={accountListId}
          handleClose={() => setRemoveTagsModalOpen(false)}
        />
      )}
    </>
  );
};
