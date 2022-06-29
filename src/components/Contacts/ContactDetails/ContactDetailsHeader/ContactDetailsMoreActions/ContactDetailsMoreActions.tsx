import React, { ReactElement } from 'react';
import { Box, IconButton, ListItemText, Menu, styled } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteIcon from '@material-ui/icons/Delete';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';

import { MoreVert } from '@material-ui/icons';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import useTaskModal from '../../../../../hooks/useTaskModal';
import Modal from '../../../../common/Modal/Modal';
import { useDeleteContactMutation } from '../../ContactDetailsTab/ContactDetailsTab.generated';
import { DeleteContactModal } from '../DeleteContactModal/DeleteContactModal';
import { useUpdateContactOtherMutation } from '../../ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../../ContactDetailContext';
import { CreateMultipleContacts } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/CreateMultipleContacts';
import {
  ContactsDocument,
  ContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsPageContext,
  ContactsPageType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

type AddMenuItem = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
};

export enum AddMenuItemsEnum {
  'ADD_REFERRALS',
  'MULTIPLE_CONTACTS',
  'ADD_DONATION',
}

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
      {actionContent.map(({ text, icon, onClick }, index) => (
        <RowContainer key={index} display="flex" onClick={onClick}>
          {icon}
          <MenuItemText primary={t(`${text}`)} />
        </RowContainer>
      ))}
    </Box>
  );
};

interface ContactDetailsMoreAcitionsProps {
  contactId: string;
  onClose: () => void;
}

export const ContactDetailsMoreAcitions: React.FC<ContactDetailsMoreAcitionsProps> = ({
  contactId,
  onClose,
}) => {
  const { openTaskModal } = useTaskModal();
  const { t } = useTranslation();
  const { accountListId, searchTerm, contactId: _, query } = React.useContext(
    ContactsPageContext,
  ) as ContactsPageType;
  const { ...queryWithoutContactId } = query;
  const { push } = useRouter();
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

  const hideContact = async (): Promise<void> => {
    const attributes = {
      id: contactId,
      status: StatusEnum.NeverAsk,
    };
    await updateContactOther({
      variables: {
        accountListId,
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
        accountListId,
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
      text: 'Add Referrals',
      icon: <PersonIcon />,
      onClick: () => {
        setReferralsModalOpen(true);
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Add Task',
      icon: <ListIcon />,
      onClick: () => {
        openTaskModal({ defaultValues: { contactIds: [contactId] } });
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Log Task',
      icon: <EditIcon />,
      onClick: () => {
        openTaskModal({
          view: 'log',
          defaultValues: { contactIds: [contactId] },
        });
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Hide Contact',
      icon: <VisibilityOffIcon />,
      onClick: () => {
        hideContact();
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Delete Contact',
      icon: <DeleteIcon />,
      onClick: () => {
        setDeleteModalOpen(true);
        setAnchorEl(undefined);
      },
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
        getContentAnchorEl={null}
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
        {
          <CreateMultipleContacts
            accountListId={accountListId ?? ''}
            handleClose={handleModalClose}
            referrals
            contactId={contactId}
          />
        }
      </Modal>
      <DeleteContactModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        deleting={deleting}
        deleteContact={handleDeleteContact}
      />
    </>
  );
};
