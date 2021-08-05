import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { DesignationAccountsList as List } from './List';
import theme from 'src/theme';

const onCheckToggle = jest.fn();

const designationAccountsGroup = {
  organizationName: 'test org',
  balance: 3500,
  designationAccounts: [
    {
      active: false,
      id: 'test-id-111',
      balanceUpdatedAt: '2/2/2021',
      convertedBalance: 3500,
      currency: 'CAD',
      designationNumber: '33221',
      name: 'Test Account',
    },
  ],
};

describe('DesignationAccountsGroupList', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <List
          designationAccountsGroup={designationAccountsGroup}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('DesignationAccountsGroupList')).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <List
          designationAccountsGroup={designationAccountsGroup}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('DesignationAccountsGroupList')).toBeInTheDocument();
    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
  });
});
