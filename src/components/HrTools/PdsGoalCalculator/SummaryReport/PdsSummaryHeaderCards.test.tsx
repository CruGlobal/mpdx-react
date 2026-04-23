import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { PdsSummaryHeaderCards } from './PdsSummaryHeaderCards';

describe('PdsSummaryHeaderCards', () => {
  it('renders the Your Goal heading and a currency value', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <PdsSummaryHeaderCards
          overallTotal={5000}
          supportRaisedPercentage={0.6}
        />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: 'Your Goal' })).toBeInTheDocument();
    expect(getByRole('heading', { name: /\$5,000/ })).toBeInTheDocument();
  });

  it('renders the Progress heading and percentage', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <PdsSummaryHeaderCards
          overallTotal={5000}
          supportRaisedPercentage={0.6}
        />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '60%' })).toBeInTheDocument();
  });

  it('handles zero total gracefully', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <PdsSummaryHeaderCards
          overallTotal={0}
          supportRaisedPercentage={0}
        />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: 'Your Goal' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
  });
});
