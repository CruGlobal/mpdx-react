import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { Account, AccountListItem as ListItem } from './ListItem';

const onCheckToggle = jest.fn();
const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};
const defaultAccount: Account = {
  active: false,
  id: 'test-id-111',
  balance: 3500,
  code: '32111',
  currency: 'CAD',
  lastSyncDate: '2021-02-02',
  name: 'Test Account',
};

const Components = ({ account = defaultAccount }: { account?: Account }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ListItem account={account} onCheckToggle={onCheckToggle} />
    </TestRouter>
  </ThemeProvider>
);

describe('AccountItem', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(<Components />);

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText(defaultAccount.name as string)).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { getByRole } = render(<Components />);

    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
  });

  it('should not render chart', async () => {
    const { queryByTestId } = render(<Components />);

    expect(queryByTestId('AccountItemChart')).not.toBeInTheDocument();
  });

  describe('AccountItem Chart', () => {
    it('should render chart', async () => {
      const entryHistoriesMock = [
        {
          closingBalance: 123,
          endDate: '2021-08-29',
          id: 'test-id-1',
        },
      ];

      const { queryByTestId } = render(
        <Components
          account={{
            ...defaultAccount,
            active: true,
            entryHistories: entryHistoriesMock,
          }}
        />,
      );

      expect(queryByTestId('AccountItemChart')).toBeInTheDocument();
    });
  });
});
