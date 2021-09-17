import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { NavBar } from './NavBar';
import theme from 'src/theme';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

const onMobileClose = jest.fn();
const accountListId = 'test-id';

describe('NavBar', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <NavBar
          accountListId={accountListId}
          onMobileClose={onMobileClose}
          openMobile={false}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
  });

  it('opened', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <NavBar
          accountListId={accountListId}
          onMobileClose={onMobileClose}
          openMobile={true}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('NavBarDrawer')).toBeInTheDocument();
  });
});
