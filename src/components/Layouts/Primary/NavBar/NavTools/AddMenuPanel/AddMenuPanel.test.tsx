import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddMenuItemsEnum } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import { AddMenuPanel } from './AddMenuPanel';

jest.mock('src/hooks/useTaskModal');

const onClose = jest.fn();
const onOpenDialog = jest.fn();
const openTaskModal = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AddMenuPanel onClose={onClose} onOpenDialog={onOpenDialog} />
  </ThemeProvider>
);

describe('AddMenuPanel', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
    });
  });

  it('default', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    expect(getByTestId('AddMenuPanelForNavBar')).toBeInTheDocument();
    [
      'Add Contact',
      'Add Multiple Contacts',
      'Add Donation',
      'Add Task',
      'Log Task',
    ].forEach((name) => {
      expect(getByRole('button', { name })).toBeInTheDocument();
    });
  });

  it.each([
    ['Add Contact', AddMenuItemsEnum.NewContact],
    ['Add Multiple Contacts', AddMenuItemsEnum.MultipleContacts],
    ['Add Donation', AddMenuItemsEnum.AddDonation],
  ])(
    '%s opens its dialog and closes the side menu',
    (name, expectedMenuItem) => {
      const { getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name }));

      expect(onOpenDialog).toHaveBeenCalledTimes(1);
      expect(onOpenDialog).toHaveBeenCalledWith(expectedMenuItem);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(openTaskModal).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['Add Task', TaskModalEnum.Add],
    ['Log Task', TaskModalEnum.Log],
  ])(
    '%s opens the task modal and closes the side menu',
    (name, expectedView) => {
      const { getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name }));

      expect(openTaskModal).toHaveBeenCalledTimes(1);
      expect(openTaskModal).toHaveBeenCalledWith({ view: expectedView });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onOpenDialog).not.toHaveBeenCalled();
    },
  );

  it('does not close the side menu before an item is clicked', () => {
    render(<TestComponent />);

    expect(onClose).not.toHaveBeenCalled();
    expect(onOpenDialog).not.toHaveBeenCalled();
    expect(openTaskModal).not.toHaveBeenCalled();
  });
});
