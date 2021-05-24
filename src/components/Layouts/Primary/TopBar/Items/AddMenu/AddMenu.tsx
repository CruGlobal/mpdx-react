import React, { ReactElement, useState } from 'react';
import {
  Box,
  Dialog,
  IconButton,
  ListItemText,
  Menu,
  styled,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../../../App';
import CreateContact from './Items/CreateContact/CreateContact';

const HoverAddIcon = styled(AddIcon)(() => ({
  textTransform: 'none',
  color: 'rgba(255,255,255,0.75)',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: 'rgba(255,255,255,1)',
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
  borderBottom: '1px solid rgb(230, 230, 230)',
  '&:hover': {
    backgroundColor: '#f2f2f2',
  },
  '&:first-child': {},
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const MenuItemText = styled(ListItemText)(({ theme }) => ({
  padding: theme.spacing(0, 1),
}));

const AddMenu = (): ReactElement => {
  const { t } = useTranslation();
  const { state } = useApp();
  const { accountListId } = state;
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);
  const { openTaskDrawer } = useApp();

  const handleAddTaskClick = (): void => {
    setAnchorEl(undefined);
    openTaskDrawer({});
  };

  const handleMenuItemClick = (menuItem: number) => {
    changeSelectedMenuItem(menuItem);
    changeDialogOpen(true);
  };

  const handleDialogClose = () => {
    changeDialogOpen(false);
  };

  const renderDialog = () => {
    const renderDialogContent = () => {
      switch (selectedMenuItem) {
        case 0:
          return (
            <CreateContact
              accountListId={accountListId ?? ''}
              handleClose={handleDialogClose}
            />
          );
      }
    };
    return (
      <Dialog
        open={dialogOpen}
        aria-labelledby={t('Create Contact Dialog')}
        fullWidth
        maxWidth="sm"
      >
        {renderDialogContent()}
      </Dialog>
    );
  };

  const addMenuContent = [
    {
      text: 'Add Contacts',
      icon: <PersonIcon />,
    },
    {
      text: 'Multiple Contact',
      icon: <PeopleIcon />,
      customOnClick: () => console.log('multiple contact'),
    },
    {
      text: 'Add Donation',
      icon: <CardGiftcardIcon />,
      customOnClick: () => console.log('add donation'),
    },
    {
      text: 'Add Task',
      icon: <ListIcon />,
      customOnClick: handleAddTaskClick,
    },
    {
      text: 'Log Task',
      icon: <EditIcon />,
      customOnClick: () => console.log('log task'),
    },
  ];

  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement>();

  return (
    <>
      <IconButton
        aria-controls="add-menu"
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <HoverAddIcon />
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
        <Box display="flex" flexDirection="column" justifyContent="center">
          {addMenuContent.map(({ text, icon, customOnClick }, index) => (
            <RowContainer
              key={index}
              display="flex"
              onClick={() =>
                customOnClick ? customOnClick() : handleMenuItemClick(index)
              }
            >
              {icon}
              <MenuItemText primary={t(`${text}`)} />
            </RowContainer>
          ))}
        </Box>
      </MenuContainer>
      {renderDialog()}
    </>
  );
};

export default AddMenu;
