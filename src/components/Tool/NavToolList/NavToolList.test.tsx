import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../theme';
import NavToolList from './NavToolList';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const toggleMock = jest.fn();

const TestComponent = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider>
        <NavToolList toggle={toggleMock} isOpen={true} />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NavToolList', () => {
  it('default', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ToolNavList')).toBeInTheDocument();
  });
  it('toggles nav', async () => {
    const { getByTestId } = render(<TestComponent />);
    const toggleButton = getByTestId('ToolNavToggle');
    expect(toggleButton).toBeInTheDocument();
    userEvent.click(toggleButton);
    await waitFor(() => {
      expect(toggleMock).toHaveBeenCalledWith(false);
    });
  });
  it('renders main menu items', () => {
    const { getAllByTestId } = render(<TestComponent />);
    const listItems = getAllByTestId('ToolNavListItem');
    expect(listItems).toHaveLength(4);
  });
  it('test notifications', async () => {
    const { getByTestId } = render(<TestComponent />);
    await waitFor(() => {
      expect(getByTestId('ToolNavList')).toBeInTheDocument();
    });
  });
});
