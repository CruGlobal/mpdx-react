import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signOut } from 'next-auth/react';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from '../../../../../../theme';
import { getTopBarMock } from '../../../TopBar/TopBar.mock';
import { ProfileMenuPanel } from './ProfileMenuPanel';

jest.mock('src/components/Setup/SetupProvider');

const router = {
  pathname: '/accountLists/[accountListId]/test',
  query: { accountListId: '1' },
  push: jest.fn(),
};

const TestComponent = () => (
  <ThemeProvider theme={theme}>
    <TestWrapper mocks={[getTopBarMock()]}>
      <TestRouter router={router}>
        <ProfileMenuPanel />
      </TestRouter>
    </TestWrapper>
  </ThemeProvider>
);

describe('ProfileMenuPanelForNavBar', () => {
  beforeEach(() => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: false,
    });
  });

  it('default', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ProfileMenuPanelForNavBar')).toBeInTheDocument();
  });

  it('render an account list button', async () => {
    const { findByTestId, getByTestId, getByText } = render(<TestComponent />);

    userEvent.click(await findByTestId('accountListSelectorButton'));
    expect(getByTestId('accountListButton-1')).toBeInTheDocument();
    expect(getByTestId('accountListButton-1')).toHaveStyle(
      'backgroundColor: #383F43;',
    );
    expect(getByText('Preferences')).toBeInTheDocument();
  });

  it('should toggle the account list selector drawer', async () => {
    const { findByTestId, getByTestId, queryByTestId } = render(
      <TestComponent />,
    );

    expect(await findByTestId('accountListSelectorButton')).toBeInTheDocument();
    expect(
      queryByTestId('closeAccountListDrawerButton'),
    ).not.toBeInTheDocument();
    userEvent.click(getByTestId('accountListSelectorButton'));
    expect(getByTestId('closeAccountListDrawerButton')).toBeInTheDocument();
  });

  it('should call router push', async () => {
    const { findByTestId, getByTestId } = render(<TestComponent />);

    userEvent.click(await findByTestId('accountListSelectorButton'));
    userEvent.click(getByTestId('accountListButton-1'));
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/',
        query: { accountListId: '1' },
      }),
    );
  });

  it('Ensure Sign Out is called with callback', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Sign Out' }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
  });

  it('hides links during the setup tour', async () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: true,
    });

    const { findByTestId, getByRole, getByTestId, queryByText } = render(
      <TestComponent />,
    );

    userEvent.click(await findByTestId('accountListSelectorButton'));
    userEvent.click(getByTestId('accountListButton-1'));
    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    expect(queryByText('Preferences')).not.toBeInTheDocument();
  });
});
