import React, { ReactElement, useState } from 'react';
import { Box, IconButton, ListItemText, Menu, styled } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';

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
          <RowContainer display="flex">
            <PersonIcon />
            <MenuItemText primary={t('Add Contacts')} />
          </RowContainer>
          <RowContainer display="flex">
            <PeopleIcon />
            <MenuItemText primary={t('Multiple Contacts')} />
          </RowContainer>
          <RowContainer display="flex">
            <CardGiftcardIcon />
            <MenuItemText primary={t('Add Donation')} />
          </RowContainer>
          <RowContainer display="flex">
            <ListIcon />
            <MenuItemText primary={t('Add Task')} />
          </RowContainer>
          <RowContainer display="flex">
            <EditIcon />
            <MenuItemText primary={t('Log Task')} />
          </RowContainer>
        </Box>
      </MenuContainer>
    </>
  );
};

export default AddMenu;
