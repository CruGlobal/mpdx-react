import React, { ReactElement, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Box, IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import useTaskModal from '../../../../../../hooks/useTaskModal';
import Modal from '../../../../../common/Modal/Modal';
import {
  DynamicAddDonation,
  preloadAddDonation,
} from './Items/AddDonation/DynamicAddDonation';
import {
  DynamicCreateContact,
  preloadCreateContact,
} from './Items/CreateContact/DynamicCreateContact';
import {
  DynamicCreateMultipleContacts,
  preloadCreateMultipleContacts,
} from './Items/CreateMultipleContacts/DynamicCreateMultipleContacts';

interface AddMenuProps {
  isInDrawer?: boolean;
}

type AddMenuItem = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
  onMouseEnter: () => void;
};

export enum AddMenuItemsEnum {
  'NEW_CONTACT',
  'MULTIPLE_CONTACTS',
  'ADD_DONATION',
}

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

const RowContainer = styled(MenuItem)(({ theme }) => ({
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
  selectedMenuItem: AddMenuItemsEnum,
  dialogOpen: boolean,
  onDialogOpen: (status: boolean) => void,
): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const modalTitle = () => {
    switch (selectedMenuItem) {
      case AddMenuItemsEnum.NEW_CONTACT:
        return t('New Contact');
      case AddMenuItemsEnum.MULTIPLE_CONTACTS:
        return t('Add Multiple Contacts');
      case AddMenuItemsEnum.ADD_DONATION:
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
      case AddMenuItemsEnum.NEW_CONTACT:
        return (
          <DynamicCreateContact
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
      case AddMenuItemsEnum.MULTIPLE_CONTACTS:
        return (
          <DynamicCreateMultipleContacts
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
      case AddMenuItemsEnum.ADD_DONATION:
        return (
          <DynamicAddDonation
            accountListId={accountListId ?? ''}
            handleClose={handleDialogClose}
          />
        );
    }
  };
  const modalSize = () => {
    switch (selectedMenuItem) {
      case AddMenuItemsEnum.NEW_CONTACT:
      case AddMenuItemsEnum.ADD_DONATION:
        return 'sm';
      case AddMenuItemsEnum.MULTIPLE_CONTACTS:
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
      {addMenuContent.map(({ text, icon, onClick, onMouseEnter }, index) => (
        <RowContainer
          tabIndex={0}
          key={index}
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

const AddMenu = ({ isInDrawer = false }: AddMenuProps): ReactElement => {
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);

  const addMenuContent = [
    {
      text: 'Add Contact',
      icon: <PersonIcon />,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.NEW_CONTACT);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadCreateContact,
    },
    {
      text: 'Add Multiple Contacts',
      icon: <PeopleIcon />,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.MULTIPLE_CONTACTS);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadCreateMultipleContacts,
    },
    {
      text: 'Add Donation',
      icon: <CardGiftcardIcon />,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.ADD_DONATION);
        changeDialogOpen(true);
        setAnchorEl(undefined);
      },
      onMouseEnter: preloadAddDonation,
    },
    {
      text: 'Add Task',
      icon: <ListIcon />,
      onClick: () => {
        openTaskModal({ view: 'add' });
        setAnchorEl(undefined);
      },
      onMouseEnter: () => preloadTaskModal('add'),
    },
    {
      text: 'Log Task',
      icon: <EditIcon />,
      onClick: () => {
        openTaskModal({ view: 'log' });
        setAnchorEl(undefined);
      },
      onMouseEnter: () => preloadTaskModal('log'),
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
        aria-expanded={Boolean(anchorEl)}
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
