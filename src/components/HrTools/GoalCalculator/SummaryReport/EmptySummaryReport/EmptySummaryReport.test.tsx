import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from '../../../../../theme';
import { EmptySummaryReport } from './EmptySummaryReport';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <EmptySummaryReport />
  </ThemeProvider>
);

describe('EmptySummaryReport', () => {
  it('renders an empty summary report', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'No Summary Report Available' }),
    ).toBeInTheDocument();
  });
});
