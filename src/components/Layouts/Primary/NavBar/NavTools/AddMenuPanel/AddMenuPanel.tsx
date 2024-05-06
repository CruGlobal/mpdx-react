import React, { ReactElement, useState } from 'react';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { List } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  AddMenuItemsEnum,
  renderDialog,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import useTaskModal from 'src/hooks/useTaskModal';
import { preloadAddDonation } from '../../../TopBar/Items/AddMenu/Items/AddDonation/DynamicAddDonation';
import { preloadCreateContact } from '../../../TopBar/Items/AddMenu/Items/CreateContact/DynamicCreateContact';
import { preloadCreateMultipleContacts } from '../../../TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import { LeafButton, LeafListItem, Title } from '../../StyledComponents';

type MenuContent = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
  onMouseEnter: () => void;
};

export const AddMenuPanel = (): ReactElement => {
  const [selectedMenuItem, changeSelectedMenuItem] =
    useState<AddMenuItemsEnum | null>(null);
  const [dialogOpen, changeDialogOpen] = useState(false);
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const theme = useTheme();
  const { t } = useTranslation();

  const addMenuContent: MenuContent[] = [
    {
      text: 'Add Contact',
      icon: PersonIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.NewContact);
        changeDialogOpen(true);
      },
      onMouseEnter: preloadCreateContact,
    },
    {
      text: 'Add Multiple Contacts',
      icon: PeopleIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.MultipleContacts);
        changeDialogOpen(true);
      },
      onMouseEnter: preloadCreateMultipleContacts,
    },
    {
      text: 'Add Donation',
      icon: CardGiftcardIcon,
      onClick: () => {
        changeSelectedMenuItem(AddMenuItemsEnum.AddDonation);
        changeDialogOpen(true);
      },
      onMouseEnter: preloadAddDonation,
    },
    {
      text: 'Add Task',
      icon: ListIcon,
      onClick: () => {
        openTaskModal({ view: 'add' });
      },
      onMouseEnter: () => preloadTaskModal('add'),
    },
    {
      text: 'Log Task',
      icon: EditIcon,
      onClick: () => {
        openTaskModal({ view: 'log' });
      },
      onMouseEnter: () => preloadTaskModal('log'),
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
        {addMenuContent.map(
          ({ text, icon: Icon, onClick, onMouseEnter }, index) => (
            <LeafListItem
              key={index}
              disableGutters
              onClick={onClick}
              onMouseEnter={onMouseEnter}
            >
              <LeafButton style={style}>
                <Icon size={18} style={iconStyle} />
                <Title>{t(text)}</Title>
              </LeafButton>
            </LeafListItem>
          ),
        )}
      </List>
      {renderDialog(selectedMenuItem, dialogOpen, changeDialogOpen)}
    </>
  );
};
