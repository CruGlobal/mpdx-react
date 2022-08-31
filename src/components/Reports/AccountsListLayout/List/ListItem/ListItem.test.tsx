import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import userEvent from '@testing-library/user-event';
import { AccountListItem as ListItem } from './ListItem';
import theme from 'src/theme';

const onCheckToggle = jest.fn();

const account = {
  active: false,
  id: 'test-id-111',
  balance: 3500,
  code: '32111',
  currency: 'CAD',
  lastSyncDate: '2/2/2021',
  name: 'Test Account',
};

describe('AccountItem', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ListItem account={account} onCheckToggle={onCheckToggle} />
      </ThemeProvider>,
    );

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText(account.name)).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListItem account={account} onCheckToggle={onCheckToggle} />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
  });

  it('should not render chart', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ListItem account={account} onCheckToggle={onCheckToggle} />
      </ThemeProvider>,
    );

    expect(queryByTestId('AccountItemChart')).not.toBeInTheDocument();
  });

  it('should render chart', async () => {
    const entryHistoriesMock = [
      {
        closingBalance: 123,
        endDate: '2021-08-29',
        id: 'test-id-1',
      },
    ];

    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <ListItem
          account={{
            ...account,
            active: true,
            entryHistories: entryHistoriesMock,
          }}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('AccountItemChart')).toBeInTheDocument();
  });
});
