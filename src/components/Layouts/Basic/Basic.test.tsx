import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../../theme';
import Basic from '.';

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
