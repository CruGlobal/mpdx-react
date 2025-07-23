import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import MoreVert from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  DynamicCreateMultipleContacts,
  preloadCreateMultipleContacts,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import Modal from 'src/components/common/Modal/Modal';
import { StatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useTaskModal from 'src/hooks/useTaskModal';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../ContactDetailContext';
import { useDeleteContactMutation } from '../../ContactDetailsTab/ContactDetailsTab.generated';
import { useUpdateContactOtherMutation } from '../../ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import {
  DynamicDeleteContactModal,
  preloadDeleteContactModal,
} from '../DeleteContactModal/DynamicDeleteContactModal';
import {
  DynamicMoreActionHideContactModal,
  preloadMoreActionHideContactModal,
} from './DynamicMoreActionHideContactModal';

const MoreButtonIcon = styled(MoreVert)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.text.primary,
}));

const MenuContainer = styled(Menu)(({ theme }) => ({
  '.MuiPaper-root': {
    width: '35ch',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  '.MuiList-root': {
    paddingBlock: 0,
  },
  '.MuiMenuItem-root + .MuiMenuItem-root': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

interface ContactDetailsMoreActionsProps {
  contactId: string;
  status: StatusEnum;
}

export const ContactDetailsMoreActions: React.FC<
  ContactDetailsMoreActionsProps
> = ({ contactId, status }) => {
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { closePanel: onClose } = useContactPanel();

  const {
    referralsModalOpen,
    setReferralsModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    anchorEl,
    setAnchorEl,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;
  const [deleteContact, { loading: deleting }] = useDeleteContactMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [updateContactOther] = useUpdateContactOtherMutation();

  const [openHideModal, setOpenHideModal] = useState(false);
  const [updateHiding, setUpdateHiding] = useState(false);
  const hideContact = async (): Promise<void> => {
    setUpdateHiding(true);
    const attributes = {
      id: contactId,
      status: StatusEnum.NeverAsk,
    };
    await updateContactOther({
      variables: {
        accountListId: accountListId ?? '',
        attributes,
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Contact hidden successfully!'), {
      variant: 'success',
    });
    onClose();
  };

  const handleDeleteContact = () => {
    deleteContact({
      variables: {
        accountListId: accountListId ?? '',
        contactId,
      },
      update: (cache) => {
        cache.evict({ id: `Contact:${contactId}` });
        cache.gc();

        enqueueSnackbar(t('Contact successfully deleted'), {
          variant: 'success',
        });
        onClose();
      },
    });
    setDeleteModalOpen(false);
    onClose();
  };

  const actionContent = [
    {
      visibility: true,
      text: t('Add Connections'),
      icon: <PersonIcon />,
      onClick: () => {
        setReferralsModalOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadCreateMultipleContacts,
    },
    {
      visibility: true,
      text: t('Add Task'),
      icon: <ListIcon />,
      onClick: () => {
        openTaskModal({
          view: TaskModalEnum.Add,
          defaultValues: { contactIds: [contactId] },
        });
        setAnchorEl(undefined);
      },
      onMouseEnter: () => preloadTaskModal(TaskModalEnum.Add),
    },
    {
      visibility: true,
      text: t('Log Task'),
      icon: <EditIcon />,
      onClick: () => {
        openTaskModal({
          view: TaskModalEnum.Log,
          defaultValues: { contactIds: [contactId] },
        });
        setAnchorEl(undefined);
      },
      onMouseEnter: () => preloadTaskModal(TaskModalEnum.Log),
    },
    {
      visibility: status !== StatusEnum.NeverAsk,
      text: t('Hide Contact'),
      icon: <VisibilityOffIcon />,
      onClick: () => {
        setOpenHideModal(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadMoreActionHideContactModal,
    },
    {
      visibility: true,
      text: t('Delete Contact'),
      icon: <DeleteIcon />,
      onClick: () => {
        setDeleteModalOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadDeleteContactModal,
    },
  ];

  const handleModalClose = () => {
    setReferralsModalOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label={t('More Actions')}
        aria-controls="more-actions"
        aria-haspopup="menu"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreButtonIcon titleAccess={t('More Actions')} />
      </IconButton>
      <MenuContainer
        id="more-actions"
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {actionContent
          .filter((item) => item.visibility)
          .map(({ text, icon, onClick, onMouseEnter }, index) => (
            <MenuItem key={index} onClick={onClick} onMouseEnter={onMouseEnter}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText>{text}</ListItemText>
            </MenuItem>
          ))}
      </MenuContainer>
      <Modal
        isOpen={referralsModalOpen}
        handleClose={handleModalClose}
        title={t('Add Connections')}
        aria-labelledby={t('Create Connection Dialog')}
        fullWidth
        size={'xl'} // TODO: Expand logic as more menu modals are added
      >
        <DynamicCreateMultipleContacts
          accountListId={accountListId ?? ''}
          handleClose={handleModalClose}
          referredById={contactId}
        />
      </Modal>
      {deleteModalOpen && (
        <DynamicDeleteContactModal
          open
          setOpen={setDeleteModalOpen}
          deleting={deleting}
          deleteContact={handleDeleteContact}
          contactId={contactId}
        />
      )}
      {openHideModal && (
        <DynamicMoreActionHideContactModal
          open
          setOpen={setOpenHideModal}
          hiding={updateHiding}
          hideContact={hideContact}
        />
      )}
    </>
  );
};
