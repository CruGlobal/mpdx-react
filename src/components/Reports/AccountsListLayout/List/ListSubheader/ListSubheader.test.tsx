import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { AccountListSubheader as ListSubheader } from './ListSubheader';
import theme from 'src/theme';

const organizationName = 'test org';

describe('AccountsGroupList', () => {
  it('default', async () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListSubheader organizationName={organizationName} />
      </ThemeProvider>,
    );

    expect(queryByText(organizationName)).toBeInTheDocument();
    expect(queryByText('Balances')).toBeInTheDocument();
  });
});
