import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { AddMenuPanel } from './AddMenuPanel';

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
