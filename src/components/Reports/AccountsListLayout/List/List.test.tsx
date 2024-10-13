import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { AccountsList as List } from './List';

const onCheckToggle = jest.fn();
const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};
const orgName = 'test org';
const accounts = [
  {
    active: false,
    id: 'test-id-111',
    balance: 3500,
    code: '32111',
    currency: 'CAD',
    lastSyncDate: '2021-02-02',
    name: 'Test Account',
  },
];

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <List
        organizationName={orgName}
        accounts={accounts}
        onCheckToggle={onCheckToggle}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('AccountsGroupList', () => {
  it('default', async () => {
    const { queryByTestId } = render(<Components />);

    expect(queryByTestId('AccountsGroupList')).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { queryByTestId, getByRole } = render(<Components />);

    expect(queryByTestId('AccountsGroupList')).toBeInTheDocument();
    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
  });
});
