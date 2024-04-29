import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../../theme';
import TopBar from '.';

describe('TopBar', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <TopBar>
            <div data-testid="PrimaryTestChildren"></div>
          </TopBar>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });
});
