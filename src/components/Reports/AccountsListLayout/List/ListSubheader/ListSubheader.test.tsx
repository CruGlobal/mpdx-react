import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { AccountListSubheader as ListSubheader } from './ListSubheader';

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
