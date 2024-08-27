import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
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
      <NavToolList toggle={toggleMock} isOpen={true} />
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
    const closeButton = getByTestId('ToolNavClose');
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);
    await waitFor(() => {
      expect(toggleMock).toHaveBeenCalledWith(false);
    });
  });
  it('renders main menu items', () => {
    const { getAllByTestId } = render(<TestComponent />);
    const listItems = getAllByTestId('ToolNavListItem');
    expect(listItems).toHaveLength(4);
  });
});
