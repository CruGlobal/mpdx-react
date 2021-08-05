import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { DesignationAccountListItem as ListItem } from './ListItem';
import theme from 'src/theme';

const onCheckToggle = jest.fn();

const designationAccount = {
  active: false,
  id: 'test-id-111',
  balanceUpdatedAt: '2/2/2021',
  convertedBalance: 3500,
  currency: 'CAD',
  designationNumber: '10139',
  name: 'Test Account',
};

describe('DesignationAccountItem', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ListItem
          designationAccount={designationAccount}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText(designationAccount.name)).toBeInTheDocument();
  });

  it('should be check event called', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListItem
          designationAccount={designationAccount}
          onCheckToggle={onCheckToggle}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('checkbox'));
    expect(onCheckToggle).toHaveBeenCalled();
    await waitFor(() => expect(getByRole('checkbox')).toBeChecked());
  });
});
