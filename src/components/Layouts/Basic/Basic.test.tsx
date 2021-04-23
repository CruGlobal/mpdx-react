import React from 'react';
import { render } from '@testing-library/react';
import Basic from '.';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

describe('Basic', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Basic>
          <div data-testid="PrimaryTestChildren"></div>
        </Basic>
      </ThemeProvider>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });
});
