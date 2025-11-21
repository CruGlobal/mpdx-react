import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { CalculationCardSkeleton } from './CalculationCardSkeleton';

const title = 'Test Title';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <CalculationCardSkeleton title={title}>
        <div>Test Child</div>
      </CalculationCardSkeleton>
    </TestRouter>
  </ThemeProvider>
);

describe('CalculationCardSkeleton', () => {
  it('renders the card with title and children', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByText(title, { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
