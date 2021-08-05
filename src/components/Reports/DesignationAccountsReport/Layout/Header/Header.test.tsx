import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import { DesignationAccountsHeader as Header } from './Header';
import theme from 'src/theme';

const totalBalance = 'CA111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('DesignationAccountsReportHeader', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <Header
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          totalBalance={totalBalance}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(totalBalance)).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));
  });
});
