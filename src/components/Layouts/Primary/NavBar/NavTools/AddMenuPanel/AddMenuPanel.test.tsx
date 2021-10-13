import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { AddMenuPanel } from './AddMenuPanel';
import theme from 'src/theme';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

describe('AddMenuPanel', () => {
  it('default', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AddMenuPanel />
      </ThemeProvider>,
    );

    expect(getByTestId('AddMenuPanelForNavBar')).toBeInTheDocument();
  });
});
