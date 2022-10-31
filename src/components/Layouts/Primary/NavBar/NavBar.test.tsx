import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MockedProvider } from '@apollo/client/testing';
import { getTopBarMultipleMock } from '../TopBar/TopBar.mock';
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
const mocks = [getTopBarMultipleMock()];

describe('NavBar', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <NavBar onMobileClose={onMobileClose} openMobile={false} />
      </ThemeProvider>,
    );

    expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
  });

  it('opened', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <NavBar onMobileClose={onMobileClose} openMobile={true} />
        </MockedProvider>
      </ThemeProvider>,
    );

    expect(queryByTestId('NavBarDrawer')).toBeInTheDocument();
  });
});
