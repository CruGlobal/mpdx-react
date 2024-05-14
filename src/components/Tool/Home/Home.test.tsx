import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../theme';
import Home from './Home';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('ToolHome', () => {
  it('default', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <Home />
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByTestId('Home')).toBeInTheDocument();
  });
});
