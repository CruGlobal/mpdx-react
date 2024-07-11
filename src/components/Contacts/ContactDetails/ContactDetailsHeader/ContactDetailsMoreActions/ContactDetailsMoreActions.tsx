import { useRouter } from 'next/router';
import React, { ReactElement, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import MoreVert from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, IconButton, ListItemText, Menu } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ContactsDocument,
  ContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import {
  DynamicCreateMultipleContacts,
  preloadCreateMultipleContacts,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import {
  AppealsContext,
  AppealsType,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import Modal from 'src/components/common/Modal/Modal';
import { StatusEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
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

type AddMenuItem = {
  visibility: boolean;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
  onMouseEnter: () => void;
};

const MoreButtonIcon = styled(MoreVert)(({ theme }) => ({
  width: 16,
  height: 16,
  color: theme.palette.text.primary,
}));

const MenuContainer = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '35ch',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  '& .MuiMenu-list': {
    padding: 0,
  },
  '& .MuiListItemText-root': {
    margin: 0,
  },
}));

const RowContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const MenuItemText = styled(ListItemText)(({ theme }) => ({
  padding: theme.spacing(0, 1),
}));

const ActionPanel = ({
  actionContent,
}: {
  actionContent: AddMenuItem[];
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      {actionContent
        .filter((i: AddMenuItem) => i.visibility)
        .map(({ text, icon, onClick, onMouseEnter }, index) => (
          <RowContainer
            key={index}
            display="flex"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
          >
            {icon}
            <MenuItemText primary={t(`${text}`)} />
          </RowContainer>
        ))}
    </Box>
  );
};

interface ContactDetailsMoreAcitionsProps {
  contactId: string;
  status: StatusEnum;
  onClose: () => void;
  contextType?: ContactContextTypesEnum;
}

export const ContactDetailsMoreAcitions: React.FC<
  ContactDetailsMoreAcitionsProps
> = ({ contactId, status, onClose, contextType }) => {
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const { t } = useTranslation();
  const { query, push } = useRouter();
  const { accountListId, searchTerm } =
    contextType === ContactContextTypesEnum.Contacts
      ? (React.useContext(ContactsContext) as ContactsType)
      : (React.useContext(AppealsContext) as AppealsType);

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
  const { contactId: _, ...queryWithoutContactId } = query;
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
      update: (cache, { data: deletedContactData }) => {
        const deletedContactId = deletedContactData?.deleteContact?.id;
        const query = {
          query: ContactsDocument,
          variables: {
            accountListId,
            searchTerm,
          },
        };

        const dataFromCache = cache.readQuery<ContactsQuery>(query);

        if (dataFromCache) {
          const data = {
            ...dataFromCache,
            contacts: {
              ...dataFromCache.contacts,
              nodes: dataFromCache.contacts.nodes.filter(
                (contact) => contact.id !== deletedContactId,
              ),
              totalCount: dataFromCache.contacts.totalCount - 1,
            },
          };
          cache.writeQuery({ ...query, data });

          push({
            pathname: '/accountLists/[accountListId]/contacts',
            query: { searchTerm, ...queryWithoutContactId },
          });
          enqueueSnackbar(t('Contact successfully deleted'), {
            variant: 'success',
          });
        }
      },
    });
    setDeleteModalOpen(false);
    onClose();
  };

  const actionContent = [
    {
      visibility: true,
      text: 'Add Referrals',
      icon: <PersonIcon />,
      onClick: () => {
        setReferralsModalOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadCreateMultipleContacts,
    },
    {
      visibility: true,
      text: 'Add Task',
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
      text: 'Log Task',
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
      text: 'Hide Contact',
      icon: <VisibilityOffIcon />,
      onClick: () => {
        setOpenHideModal(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadMoreActionHideContactModal,
    },
    {
      visibility: true,
      text: 'Delete Contact',
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
        aria-controls="add-menu"
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreButtonIcon titleAccess="More Actions" />
      </IconButton>
      <MenuContainer
        id="add-menu"
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <ActionPanel actionContent={actionContent} />
      </MenuContainer>
      <Modal
        isOpen={referralsModalOpen}
        handleClose={handleModalClose}
        title={t('Add Referrals')}
        aria-labelledby={t('Create Referral Dialog')}
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
