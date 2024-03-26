import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContactsContext,
  ContactsType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsContext';
import { ContactRightClickMenu } from './ContactRightClickMenu';

const contactId = 'contactId';

interface ComponentsProps {
  returnContactUrl?: () => void;
}

const Components = ({ returnContactUrl = jest.fn() }: ComponentsProps) => {
  const rightClickRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const handleRightClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowMenu(true);
  };

  return (
    <ContactsContext.Provider
      value={{ returnContactUrl } as unknown as ContactsType}
    >
      <Button ref={rightClickRef} onContextMenu={handleRightClick}>
        Button to open menu
      </Button>
      <ContactRightClickMenu
        contactId={contactId}
        rightClickRef={rightClickRef}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
      />
    </ContactsContext.Provider>
  );
};

describe('ContactRightClickMenu', () => {
  it('should NOT open menu on left-click', () => {
    const { getByRole, queryByRole } = render(<Components />);

    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(queryByRole('menu')).not.toBeInTheDocument();

    userEvent.click(button);
    expect(queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should open menu on right-click', () => {
    const { getByRole, queryByRole } = render(<Components />);

    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(queryByRole('menu')).not.toBeInTheDocument();

    userEvent.click(button, { button: 2 });
    const menu = getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('calls returnContactUrl', () => {
    jest.spyOn(window, 'open');
    const returnContactUrl = jest.fn().mockReturnValue({
      pathname: 'pathname',
      filteredQuery: 'filteredQuery',
    });
    const { getByRole } = render(
      <Components returnContactUrl={returnContactUrl} />,
    );
    const button = getByRole('button');
    userEvent.click(button, { button: 2 });

    const menuItem = getByRole('menuitem', {
      name: /open contact in new tab/i,
    });
    expect(menuItem).toBeInTheDocument();
    userEvent.click(menuItem);
    expect(returnContactUrl).toHaveBeenCalledWith(contactId);
    expect(window.open).toHaveBeenCalledWith('pathname', '_blank');
  });
});
