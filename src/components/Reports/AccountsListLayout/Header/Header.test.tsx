import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { AccountsListHeader as Header } from './Header';
import theme from 'src/theme';

const totalBalance = 'CA111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('AccountsListHeader', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <Header
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={totalBalance}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('CA111')).toBeInTheDocument();
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Toggle Filter Panel' }),
    );
  });

  it('should not render rightExtra if undefined', async () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <Header
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={undefined}
        />
      </ThemeProvider>,
    );

    expect(queryByText('CA111')).toBeNull();
  });
});
