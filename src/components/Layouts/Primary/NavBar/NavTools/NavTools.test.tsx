import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { AddMenuItemsEnum } from '../../TopBar/Items/AddMenu/AddMenu';
import { getTopBarMultipleMock } from '../../TopBar/TopBar.mock';
import { NavTools } from './NavTools';

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

const onClose = jest.fn();
const onOpenAddDialog = jest.fn();

interface TestComponentProps {
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ onSetupTour }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider mocks={[getTopBarMultipleMock()]} addTypename={false}>
        <TestSetupProvider onSetupTour={onSetupTour}>
          <NavTools onClose={onClose} onOpenAddDialog={onOpenAddDialog} />
        </TestSetupProvider>
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NavTools', () => {
  it('default', async () => {
    const { findByText, getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(getByText('Add')).toBeInTheDocument();
    expect(await findByText('John Smith')).toBeInTheDocument();
  });

  it('passes the Add panel clicks up so the side menu can close and open the dialog', async () => {
    const { getByText, findByRole } = render(<TestComponent />);

    userEvent.click(getByText('Add'));
    userEvent.click(await findByRole('button', { name: 'Add Contact' }));

    expect(onOpenAddDialog).toHaveBeenCalledTimes(1);
    expect(onOpenAddDialog).toHaveBeenCalledWith(AddMenuItemsEnum.NewContact);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the side menu when Add Task is clicked', async () => {
    const { getByText, findByRole } = render(<TestComponent />);

    userEvent.click(getByText('Add'));
    userEvent.click(await findByRole('button', { name: 'Add Task' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenAddDialog).not.toHaveBeenCalled();
  });

  it('hides links during the setup tour', async () => {
    const { queryByText, getByTestId } = render(<TestComponent onSetupTour />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(queryByText('Add')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('John Smith')).not.toBeInTheDocument(),
    );
  });
});
