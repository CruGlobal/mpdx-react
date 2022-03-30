import React, { ReactElement, useState } from 'react';
import { Box, IconButton, ListItemText, Menu, styled } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteIcon from '@material-ui/icons/Delete';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';

import { MoreVert } from '@material-ui/icons';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { useAccountListId } from '../../../../../hooks/useAccountListId';
import Modal from '../../../../common/Modal/Modal';
import { CreateMultipleContacts } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/CreateMultipleContacts';

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

export const renderDialog = (
  contactId: string,
  selectedMenuItem: number,
  modalOpen: boolean,
  onModalOpen: (status: boolean) => void,
): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const modalTitle = () => {
    switch (selectedMenuItem) {
      case AddMenuItemsEnum.ADD_REFERRALS:
        return t('Add Referrals');
      default:
        return t('Add Referrals');
    }
  };

  const handleModalClose = () => {
    onModalOpen(false);
  };

  const renderDialogContent = (contactId?: string) => {
    switch (selectedMenuItem) {
      case AddMenuItemsEnum.ADD_REFERRALS:
        return (
          <CreateMultipleContacts
            accountListId={accountListId ?? ''}
            handleClose={handleModalClose}
            referrals
            contactId={contactId}
          />
        );
    }
  };
  const modalSize = () => {
    switch (selectedMenuItem) {
      case AddMenuItemsEnum.ADD_REFERRALS:
        return 'xl';
      case AddMenuItemsEnum.ADD_DONATION:
        return 'sm';
      default:
        return 'md';
    }
  };

  return (
    <Modal
      isOpen={modalOpen}
      handleClose={handleModalClose}
      title={modalTitle()}
      aria-labelledby={modalTitle()}
      fullWidth
      size={modalSize()} // TODO: Expand logic as more menu modals are added
    >
      {renderDialogContent(contactId)}
    </Modal>
  );
};

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
}

export const ContactDetailsMoreAcitions: React.FC<ContactDetailsMoreAcitionsProps> = ({
  contactId,
}) => {
  const { openTaskModal } = useTaskModal();
  const accountListId = useAccountListId();
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const actionContent = [
    {
      text: 'Add Referrals',
      icon: <PersonIcon />,
      onClick: () => {
        setModalOpen(true);
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
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Delete Contact',
      icon: <DeleteIcon />,
      onClick: () => {
        setAnchorEl(undefined);
      },
    },
  ];

  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

  const handleModalClose = () => {
    setModalOpen(false);
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
        isOpen={modalOpen}
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
    </>
  );
};
