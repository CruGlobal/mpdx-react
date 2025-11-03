import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { AboutForm } from './AboutForm';

const handleNext = jest.fn();
const boardApprovalDate = '2024-09-15';
const availabilityDate = '2024-10-01';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <AboutForm
        boardApprovalDate={boardApprovalDate}
        availableDate={availabilityDate}
        handleNext={handleNext}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('AboutForm', () => {
  it('renders form and formatted dates', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /a minister's housing allowance request is a form ministers complete/i,
      ),
    ).toBeInTheDocument();
    expect(getByText(/9\/15\/2024/)).toBeInTheDocument();
    expect(getByText(/10\/1\/2024/)).toBeInTheDocument();
  });

  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });
});
