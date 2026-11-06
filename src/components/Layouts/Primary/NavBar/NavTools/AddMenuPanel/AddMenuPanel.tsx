import React, { ReactElement } from 'react';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { List } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { AddMenuItemsEnum } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { preloadAddDonation } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/DynamicAddDonation';
import { preloadCreateContact } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateContact/DynamicCreateContact';
import { preloadCreateMultipleContacts } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useTaskModal from 'src/hooks/useTaskModal';
import { LeafButton, LeafListItem, Title } from '../../StyledComponents';

type MenuContent = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  onClick: () => void;
  onMouseEnter: () => void;
};

interface AddMenuPanelProps {
  onClose: () => void;
  onOpenDialog: (menuItem: AddMenuItemsEnum) => void;
}

export const AddMenuPanel = ({
  onClose,
  onOpenDialog,
}: AddMenuPanelProps): ReactElement => {
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const theme = useTheme();
  const { t } = useTranslation();

  const addMenuContent: MenuContent[] = [
    {
      text: t('Add Contact'),
      icon: PersonIcon,
      onClick: () => {
        onOpenDialog(AddMenuItemsEnum.NewContact);
      },
      onMouseEnter: preloadCreateContact,
    },
    {
      text: t('Add Multiple Contacts'),
      icon: PeopleIcon,
      onClick: () => {
        onOpenDialog(AddMenuItemsEnum.MultipleContacts);
      },
      onMouseEnter: preloadCreateMultipleContacts,
    },
    {
      text: t('Add Donation'),
      icon: CardGiftcardIcon,
      onClick: () => {
        onOpenDialog(AddMenuItemsEnum.AddDonation);
      },
      onMouseEnter: preloadAddDonation,
    },
    {
      text: t('Add Task'),
      icon: ListIcon,
      onClick: () => {
        openTaskModal({ view: TaskModalEnum.Add });
      },
      onMouseEnter: () => preloadTaskModal(TaskModalEnum.Add),
    },
    {
      text: t('Log Task'),
      icon: EditIcon,
      onClick: () => {
        openTaskModal({ view: TaskModalEnum.Log });
      },
      onMouseEnter: () => preloadTaskModal(TaskModalEnum.Log),
    },
  ];

  const style = { paddingLeft: 40, paddingTop: 11, paddingBottom: 11 };
  const iconStyle = {
    color: theme.palette.common.white,
    fontSize: 18,
    marginRight: theme.spacing(1.5),
  };

  return (
    <List disablePadding data-testid="AddMenuPanelForNavBar">
      {addMenuContent.map(
        ({ text, icon: Icon, onClick, onMouseEnter }, index) => (
          <LeafListItem
            key={index}
            disableGutters
            onClick={() => {
              onClick();
              onClose();
            }}
            onMouseEnter={onMouseEnter}
          >
            <LeafButton style={style}>
              <Icon size={18} style={iconStyle} />
              <Title>{text}</Title>
            </LeafButton>
          </LeafListItem>
        ),
      )}
    </List>
  );
};
