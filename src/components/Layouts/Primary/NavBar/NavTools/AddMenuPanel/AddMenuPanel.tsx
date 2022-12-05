import React, { ReactElement, useState } from 'react';
import { List } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { LeafButton, LeafListItem, Title } from '../../NavItem/NavItem';
import useTaskModal from 'src/hooks/useTaskModal';
import {
  AddMenuItemsEnum,
  renderDialog,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';

type MenuContent = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
};

export const AddMenuPanel = (): ReactElement => {
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);
  const { openTaskModal } = useTaskModal();
  const theme = useTheme();
  const { t } = useTranslation();

  const addMenuContent: MenuContent[] = [
    {
      text: 'Add Contact',
      icon: PersonIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.NEW_CONTACT);
        changeDialogOpen(true);
      },
    },
    {
      text: 'Multiple Contacts',
      icon: PeopleIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.MULTIPLE_CONTACTS);
        changeDialogOpen(true);
      },
    },
    {
      text: 'Add Donation',
      icon: CardGiftcardIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.ADD_DONATION);
        changeDialogOpen(true);
      },
    },
    {
      text: 'Add Task',
      icon: ListIcon,
      onClick: () => {
        openTaskModal({});
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
      <List disablePadding data-testid="AddMenuPanelForNavBar">
        {addMenuContent.map(({ text, icon: Icon, onClick }, index) => (
          <LeafListItem key={index} disableGutters onClick={onClick}>
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
