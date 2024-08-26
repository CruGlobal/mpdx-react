import React, { ReactElement, useState } from 'react';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Hidden, ListItemText, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  DynamicMassActionsAddTagsModal,
  preloadMassActionsAddTagsModal,
} from 'src/components/Contacts/MassActions/AddTags/DynamicMassActionsAddTagsModal';
import {
  DynamicMassActionsAddToAppealModal,
  preloadMassActionsAddToAppealModal,
} from 'src/components/Contacts/MassActions/AddToAppeal/DynamicMassActionsAddToAppealModal';
import {
  DynamicMassActionsCreateAppealModal,
  preloadMassActionsCreateAppealModal,
} from 'src/components/Contacts/MassActions/AddToAppeal/DynamicMassActionsCreateAppealModal';
import {
  DynamicMassActionsEditFieldsModal,
  preloadMassActionsEditFieldsModal,
} from 'src/components/Contacts/MassActions/EditFields/DynamicMassActionsEditFieldsModal';
import {
  DynamicExportsModal,
  preloadExportsModal,
} from 'src/components/Contacts/MassActions/Exports/DynamicExportsModal';
import {
  DynamicMassActionsExportEmailsModal,
  preloadMassActionsExportEmailsModal,
} from 'src/components/Contacts/MassActions/Exports/Emails/DynamicMassActionsExportEmailsModal';
import { DynamicMailMergedLabelModal } from 'src/components/Contacts/MassActions/Exports/MailMergedLabelModal/DynamicMailMergedLabelModal';
import { useMassActionsUpdateContactsMutation } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import {
  DynamicMassActionsMergeModal,
  preloadMassActionsMergeModal,
} from 'src/components/Contacts/MassActions/Merge/DynamicMassActionsMergeModal';
import {
  DynamicMassActionsRemoveTagsModal,
  preloadMassActionsRemoveTagsModal,
} from 'src/components/Contacts/MassActions/RemoveTags/DynamicMassActionsRemoveTagsModal';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import {
  DynamicAddExcludedContactModal,
  preloadAddExcludedContactModal,
} from 'src/components/Tool/Appeal/Modals/AddExcludedContactModal/DynamicAddExcludedContactModal';
import { StatusEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { PageEnum, TableViewModeEnum } from '../Header/ListHeader';
import {
  DynamicHideContactsModal,
  preloadHideContactsModal,
} from '../HideContactsModal/DynamicHideContactsModal';
import { MassActionsDropdown } from './MassActionsDropdown';

interface ContactsMassActionsDropdownProps {
  filterPanelOpen: boolean;
  contactDetailsOpen: boolean;
  contactsView?: TableViewModeEnum;
  buttonGroup?: ReactElement;
  selectedIds: string[];
  page: PageEnum;
  isExcludedAppealPage?: boolean;
}

export const ContactsMassActionsDropdown: React.FC<
  ContactsMassActionsDropdownProps
> = ({
  filterPanelOpen,
  contactDetailsOpen,
  contactsView,
  buttonGroup,
  selectedIds,
  page,
  isExcludedAppealPage = false,
}) => {
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

  const { openTaskModal, preloadTaskModal } = useTaskModal();

  const [openRemoveTagsModal, setOpenRemoveTagsModal] = useState(false);
  const [openAddTagsModal, setOpenAddTagsModal] = useState(false);
  const [addToAppealModalOpen, setAddToAppealModalOpen] = useState(false);
  const [createAppealModalOpen, setCreateAppealModalOpen] = useState(false);
  const [editFieldsModalOpen, setEditFieldsModalOpen] = useState(false);
  const [hideContactsModalOpen, setHideContactsModalOpen] = useState(false);
  const [exportsModalOpen, setExportsModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [exportEmailsModalOpen, setExportEmailsModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [addExcludedToAppealModalOpen, setAddExcludedToAppealModalOpen] =
    useState(false);

  const [updateContacts] = useMassActionsUpdateContactsMutation();

  const hideContacts = async () => {
    await updateContacts({
      variables: {
        accountListId: accountListId ?? '',
        attributes: selectedIds.map((id) => ({
          id,
          status: StatusEnum.NeverAsk,
        })),
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Contact(s) hidden successfully'), {
      variant: 'success',
    });
    setHideContactsModalOpen(false);
  };

  return (
    <>
      {contactsView !== TableViewModeEnum.Map && (
        <Hidden xsDown>
          {selectedIds?.length > 0 && (
            <>
              <MassActionsDropdown handleClick={handleClick} open={open}>
                {filterPanelOpen && contactDetailsOpen ? (
                  <MoreHoriz />
                ) : (
                  t('Actions')
                )}
              </MassActionsDropdown>
              <Menu
                open={open}
                onClose={handleClose}
                disableRestoreFocus={true}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <MenuItem
                  onClick={() => {
                    setExportsModalOpen(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadExportsModal}
                >
                  <ListItemText>{t('Export')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    if (selectedIds.length >= 2) {
                      setMergeModalOpen(true);
                    } else {
                      enqueueSnackbar(
                        t('You must select at least 2 contacts to merge.'),
                        {
                          variant: 'error',
                        },
                      );
                    }
                    handleClose();
                  }}
                  onMouseEnter={preloadMassActionsMergeModal}
                >
                  <ListItemText>{t('Merge')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenAddTagsModal(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadMassActionsAddTagsModal}
                >
                  <ListItemText>{t('Add Tags')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    setOpenRemoveTagsModal(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadMassActionsRemoveTagsModal}
                >
                  <ListItemText>{t('Remove Tags')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    openTaskModal({
                      view: TaskModalEnum.Add,
                      defaultValues: { contactIds: selectedIds },
                    });
                    handleClose();
                  }}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Add)}
                >
                  <ListItemText>{t('Add Task')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    openTaskModal({
                      view: TaskModalEnum.Log,
                      defaultValues: { contactIds: selectedIds },
                    });
                    handleClose();
                  }}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Log)}
                >
                  <ListItemText>{t('Log Task')}</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setEditFieldsModalOpen(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadMassActionsEditFieldsModal}
                >
                  <ListItemText>{t('Edit Fields')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setHideContactsModalOpen(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadHideContactsModal}
                >
                  <ListItemText>{t('Hide Contacts')}</ListItemText>
                </MenuItem>

                {isExcludedAppealPage && (
                  <MenuItem
                    onClick={() => {
                      setAddExcludedToAppealModalOpen(true);
                      handleClose();
                    }}
                    onMouseEnter={preloadAddExcludedContactModal}
                  >
                    <ListItemText>
                      {t('Add Excluded Contacts To Appeal')}
                    </ListItemText>
                  </MenuItem>
                )}

                {page !== PageEnum.Appeal && (
                  <>
                    {!isExcludedAppealPage && (
                      <MenuItem
                        onClick={() => {
                          setAddToAppealModalOpen(true);
                          handleClose();
                        }}
                        onMouseEnter={preloadMassActionsAddToAppealModal}
                      >
                        <ListItemText>{t('Add to Appeal')}</ListItemText>
                      </MenuItem>
                    )}
                    <MenuItem
                      divider
                      onClick={() => {
                        setCreateAppealModalOpen(true);
                        handleClose();
                      }}
                      onMouseEnter={preloadMassActionsCreateAppealModal}
                    >
                      <ListItemText>{t('Add to New Appeal')}</ListItemText>
                    </MenuItem>
                  </>
                )}

                <MenuItem
                  onClick={() => {
                    setExportEmailsModalOpen(true);
                    handleClose();
                  }}
                  onMouseEnter={preloadMassActionsExportEmailsModal}
                >
                  <ListItemText>{t('Export Emails')}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Hidden>
      )}

      {buttonGroup}

      {openRemoveTagsModal && (
        <DynamicMassActionsRemoveTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenRemoveTagsModal(false)}
        />
      )}
      {openAddTagsModal && (
        <DynamicMassActionsAddTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenAddTagsModal(false)}
        />
      )}
      {addToAppealModalOpen && (
        <DynamicMassActionsAddToAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setAddToAppealModalOpen(false)}
        />
      )}
      {createAppealModalOpen && (
        <DynamicMassActionsCreateAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setCreateAppealModalOpen(false)}
        />
      )}
      {editFieldsModalOpen && (
        <DynamicMassActionsEditFieldsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setEditFieldsModalOpen(false)}
        />
      )}
      {hideContactsModalOpen && (
        <DynamicHideContactsModal
          open={hideContactsModalOpen}
          setOpen={setHideContactsModalOpen}
          onConfirm={hideContacts}
          multi={selectedIds.length > 1}
        />
      )}
      {exportsModalOpen && (
        <DynamicExportsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setExportsModalOpen(false)}
          openMailMergedLabelModal={() => setLabelModalOpen(true)}
        />
      )}
      {labelModalOpen && (
        <DynamicMailMergedLabelModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setLabelModalOpen(false)}
        />
      )}
      {exportEmailsModalOpen && (
        <DynamicMassActionsExportEmailsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setExportEmailsModalOpen(false)}
        />
      )}
      {mergeModalOpen && (
        <DynamicMassActionsMergeModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setMergeModalOpen(false)}
        />
      )}
      {addExcludedToAppealModalOpen && (
        <DynamicAddExcludedContactModal
          contactIds={selectedIds}
          handleClose={() => setAddExcludedToAppealModalOpen(false)}
        />
      )}
    </>
  );
};
