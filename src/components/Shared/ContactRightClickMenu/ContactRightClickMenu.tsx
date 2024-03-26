import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ContactsContext,
  ContactsType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsContext';

interface Props {
  contactId: string;
  rightClickRef: React.MutableRefObject<null>;
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContactRightClickMenu: React.FC<Props> = ({
  contactId,
  rightClickRef,
  showMenu,
  setShowMenu,
}) => {
  const { t } = useTranslation();
  const { returnContactUrl } = React.useContext(
    ContactsContext,
  ) as ContactsType;

  const returnRightClickRef = () => {
    // Have to convert it to Element for anchorEl prop.
    // rightClickRef.current will never return null after the initial render.
    return rightClickRef.current as unknown as Element;
  };

  const handleOpenInNewTab = () => {
    const { pathname } = returnContactUrl(contactId);
    window.open(pathname, '_blank')?.focus();
  };

  return (
    <Menu
      anchorEl={returnRightClickRef}
      open={showMenu}
      onClose={() => setShowMenu(false)}
    >
      <MenuItem onClick={handleOpenInNewTab}>
        {t('Open contact in new tab')}
      </MenuItem>
    </Menu>
  );
};
