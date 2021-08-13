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

import useTaskDrawer from '../../../../../../hooks/useTaskDrawer';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import CreateContact from './Items/CreateContact/CreateContact';

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

const AddMenu = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { openTaskDrawer } = useTaskDrawer();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);

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
      onClick: () => console.log('multiple contacts'),
    },
    {
      text: 'Add Donation',
      icon: <CardGiftcardIcon />,
      onClick: () => console.log('add donation'),
    },
    {
      text: 'Add Task',
      icon: <ListIcon />,
      onClick: () => {
        openTaskDrawer({});
        setAnchorEl(undefined);
      },
    },
    {
      text: 'Log Task',
      icon: <EditIcon />,
      onClick: () => console.log('log task'),
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
        <Box display="flex" flexDirection="column" justifyContent="center">
          {addMenuContent.map(({ text, icon, onClick }, index) => (
            <RowContainer key={index} display="flex" onClick={onClick}>
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
