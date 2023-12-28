import React, { ReactElement, useState } from 'react';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { Hidden, ListItemText, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { MassActionsAddTagsModal } from 'src/components/Contacts/MassActions/AddTags/MassActionsAddTagsModal';
import { MassActionsAddToAppealModal } from 'src/components/Contacts/MassActions/AddToAppeal/MassActionsAddToAppealModal';
import { MassActionsCreateAppealModal } from 'src/components/Contacts/MassActions/AddToAppeal/MassActionsCreateAppealModal';
import { MassActionsEditFieldsModal } from 'src/components/Contacts/MassActions/EditFields/MassActionsEditFieldsModal';
import { MassActionsExportEmailsModal } from 'src/components/Contacts/MassActions/Exports/Emails/MassActionsExportEmailsModal';
import { ExportsModal } from 'src/components/Contacts/MassActions/Exports/ExportsModal';
import { MailMergedLabelModal } from 'src/components/Contacts/MassActions/Exports/MailMergedLabelModal/MailMergedLabelModal';
import { useMassActionsUpdateContactsMutation } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import { MassActionsMergeModal } from 'src/components/Contacts/MassActions/Merge/MassActionsMergeModal';
import { MassActionsRemoveTagsModal } from 'src/components/Contacts/MassActions/RemoveTags/MassActionsRemoveTagsModal';
import { HideContactsModal } from 'src/components/Shared/HideContactsModal/HideContactsModal';
import { StatusEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { TableViewModeEnum } from '../Header/ListHeader';
import { MassActionsDropdown } from './MassActionsDropdown';

interface ContactsMassActionsDropdownProps {
  filterPanelOpen: boolean;
  contactDetailsOpen: boolean;
  contactsView?: TableViewModeEnum;
  buttonGroup?: ReactElement;
  selectedIds: string[];
}

export const ContactsMassActionsDropdown: React.FC<
  ContactsMassActionsDropdownProps
> = ({
  filterPanelOpen,
  contactDetailsOpen,
  contactsView,
  buttonGroup,
  selectedIds,
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

  const { openTaskModal } = useTaskModal();

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
                >
                  <ListItemText>{t('Merge')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenAddTagsModal(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Add Tags')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    setOpenRemoveTagsModal(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Remove Tags')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    openTaskModal({
                      view: 'add',
                      defaultValues: { contactIds: selectedIds },
                    });
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Add Task')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    openTaskModal({
                      view: 'log',
                      defaultValues: { contactIds: selectedIds },
                    });
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Log Task')}</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setEditFieldsModalOpen(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Edit Fields')}</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setHideContactsModalOpen(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Hide Contacts')}</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setAddToAppealModalOpen(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Add to Appeal')}</ListItemText>
                </MenuItem>
                <MenuItem
                  divider
                  onClick={() => {
                    setCreateAppealModalOpen(true);
                    handleClose();
                  }}
                >
                  <ListItemText>{t('Add to New Appeal')}</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setExportEmailsModalOpen(true);
                    handleClose();
                  }}
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
        <MassActionsRemoveTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenRemoveTagsModal(false)}
        />
      )}
      {openAddTagsModal && (
        <MassActionsAddTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenAddTagsModal(false)}
        />
      )}
      {addToAppealModalOpen && (
        <MassActionsAddToAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setAddToAppealModalOpen(false)}
        />
      )}
      {createAppealModalOpen && (
        <MassActionsCreateAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setCreateAppealModalOpen(false)}
        />
      )}
      {editFieldsModalOpen && (
        <MassActionsEditFieldsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setEditFieldsModalOpen(false)}
        />
      )}
      {hideContactsModalOpen && (
        <HideContactsModal
          open={hideContactsModalOpen}
          setOpen={setHideContactsModalOpen}
          onConfirm={hideContacts}
          multi={selectedIds.length > 1}
        />
      )}
      {exportsModalOpen && (
        <ExportsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setExportsModalOpen(false)}
          openMailMergedLabelModal={() => setLabelModalOpen(true)}
        />
      )}
      {labelModalOpen && (
        <MailMergedLabelModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setLabelModalOpen(false)}
        />
      )}
      {exportEmailsModalOpen && (
        <MassActionsExportEmailsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setExportEmailsModalOpen(false)}
        />
      )}
      {mergeModalOpen && (
        <MassActionsMergeModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setMergeModalOpen(false)}
        />
      )}
    </>
  );
};
