import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import TopBar from '.';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';

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
