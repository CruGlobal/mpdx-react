import React, { ReactElement, useState } from 'react';
import { Box, IconButton, ListItemText, Menu, styled } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';

import useTaskModal from '../../../../../../hooks/useTaskModal';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import Modal from '../../../../../common/Modal/Modal';
import CreateContact from './Items/CreateContact/CreateContact';
import { CreateMultipleContacts } from './Items/CreateMultipleContacts/CreateMultipleContacts';
import { AddDonation } from './Items/AddDonation/AddDonation';

interface AddMenuProps {
  isInDrawer?: boolean;
}

type AddMenuItem = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
};

const HoverAddIcon = styled(AddIcon)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.common.white,
  opacity: '0.75',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    opacity: '1',
  },
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
  selectedMenuItem: number,
  dialogOpen: boolean,
  onDialogOpen: (status: boolean) => void,
): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const modalTitle = () => {
    switch (selectedMenuItem) {
      case 0:
        return t('New Contact');
      case 1:
        return t('Add Multiple Contacts');
      case 2:
        return t('Add Donation');
      default:
        return t('Add Contact');
    }
  };

  const handleDialogClose = () => {
    onDialogOpen(false);
  };

  const renderDialogContent = () => {
    switch (selectedMenuItem) {
      case 0:
        return (
          <CreateContact
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
      case 1:
        return (
          <CreateMultipleContacts
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
      case 2:
        return (
          <AddDonation
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
    }
  };
  const modalSize = () => {
    switch (selectedMenuItem) {
      case 0:
      case 2:
        return 'sm';
      case 1:
        return 'xl';
      default:
        return 'md';
    }
  };

  return (
    <Modal
      isOpen={dialogOpen}
      handleClose={handleDialogClose}
      title={modalTitle()}
      aria-labelledby={modalTitle()}
      fullWidth
      size={modalSize()} // TODO: Expand logic as more menu modals are added
    >
      {renderDialogContent()}
    </Modal>
  );
};

const AddMenuPanel = ({
  addMenuContent,
}: {
  addMenuContent: AddMenuItem[];
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      {addMenuContent.map(({ text, icon, onClick }, index) => (
        <RowContainer key={index} display="flex" onClick={onClick}>
          {icon}
          <MenuItemText primary={t(`${text}`)} />
        </RowContainer>
      ))}
    </Box>
  );
};

const AddMenu = ({ isInDrawer = false }: AddMenuProps): ReactElement => {
  const { openTaskModal } = useTaskModal();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);

  const addMenuContent = [
    {
      text: 'Add Contact',
      icon: <PersonIcon />,
      onClick: () => {
        changeSelectedMenuItem(0);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Multiple Contacts',
      icon: <PeopleIcon />,
      onClick: () => {
        changeSelectedMenuItem(1);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Add Donation',
      icon: <CardGiftcardIcon />,
      onClick: () => {
        changeSelectedMenuItem(2);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Add Task',
      icon: <ListIcon />,
      onClick: () => {
        openTaskModal({});
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Log Task',
      icon: <EditIcon />,
      onClick: () => {
        openTaskModal({ view: 'log' });
        setAnchorEl(undefined);
      },
    },
  ];

  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

  if (isInDrawer) {
    return <AddMenuPanel addMenuContent={addMenuContent} />;
  }

  return (
    <>
      <IconButton
        aria-controls="add-menu"
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <HoverAddIcon titleAccess="Add Button" />
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
        <AddMenuPanel addMenuContent={addMenuContent} />
      </MenuContainer>
      {renderDialog(selectedMenuItem, dialogOpen, changeDialogOpen)}
    </>
  );
};

export default AddMenu;
