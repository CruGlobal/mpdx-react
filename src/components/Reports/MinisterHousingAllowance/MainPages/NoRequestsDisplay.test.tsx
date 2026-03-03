import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NoRequestsDisplay } from './NoRequestsDisplay';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <NoRequestsDisplay />
    </LocalizationProvider>
  </ThemeProvider>
);

describe('NoRequestsDisplay', () => {
  it('should render no requests message', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('no-requests-display')).toBeInTheDocument();
  });

  it('should render contact email link', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'MHA@cru.org' })).toHaveAttribute(
      'href',
      'mailto:MHA@cru.org',
    );
  });
});
