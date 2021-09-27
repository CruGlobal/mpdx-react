import React, { ReactElement, useState } from 'react';
import { List, useTheme } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import ListIcon from '@material-ui/icons/FormatListBulleted';
import EditIcon from '@material-ui/icons/Edit';
import { useTranslation } from 'react-i18next';
import { LeafButton, LeafListItem, Title } from '../../NavItem/NavItem';
import useTaskDrawer from 'src/hooks/useTaskDrawer';
import { renderDialog } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';

type MenuContent = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
};

export const AddMenuPanel = (): ReactElement => {
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);
  const { openTaskDrawer } = useTaskDrawer();
  const theme = useTheme();
  const { t } = useTranslation();

  const addMenuContent: MenuContent[] = [
    {
      text: 'Add Contact',
      icon: PersonIcon,
      onClick: () => {
        changeSelectedMenuItem(0);
        changeDialogOpen(true);
      },
    },
    {
      text: 'Multiple Contacts',
      icon: PeopleIcon,
      onClick: () => console.log('multiple contacts'),
    },
    {
      text: 'Add Donation',
      icon: CardGiftcardIcon,
      onClick: () => console.log('add donation'),
    },
    {
      text: 'Add Task',
      icon: ListIcon,
      onClick: () => {
        openTaskDrawer({});
      },
    },
    {
      text: 'Log Task',
      icon: EditIcon,
      onClick: () => console.log('log task'),
    },
  ];

  const style = { paddingLeft: 40, paddingTop: 11, paddingBottom: 11 };
  const iconStyle = {
    color: theme.palette.common.white,
    fontSize: 18,
    marginRight: theme.spacing(1.5),
  };

  return (
    <>
      <List disablePadding>
        {addMenuContent.map(({ text, icon: Icon, onClick }, index) => (
          <LeafListItem key={index} button disableGutters onClick={onClick}>
            <LeafButton style={style}>
              <Icon size={18} style={iconStyle} />
              <Title>{t(text)}</Title>
            </LeafButton>
          </LeafListItem>
        ))}
      </List>
      {renderDialog(selectedMenuItem, dialogOpen, changeDialogOpen)}
    </>
  );
};
