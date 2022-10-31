import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { AccountsList as List } from './List';
import theme from 'src/theme';

const onCheckToggle = jest.fn();

const orgName = 'test org';

const accounts = [
  {
    active: false,
    id: 'test-id-111',
    balance: 3500,
    code: '32111',
    currency: 'CAD',
    lastSyncDate: '2/2/2021',
    name: 'Test Account',
  },
];

describe('AccountsGroupList', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <List
          organizationName={orgName}
          accounts={accounts}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('AccountsGroupList')).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <List
          organizationName={orgName}
          accounts={accounts}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('AccountsGroupList')).toBeInTheDocument();
    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
  });
});
