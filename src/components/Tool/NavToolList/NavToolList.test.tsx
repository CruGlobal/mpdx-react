import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../theme';
import NavToolList from './NavToolList';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('NavToolList', () => {
  it('default', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <NavToolList />
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByTestId('ToolNavList')).toBeInTheDocument();
  });
});
