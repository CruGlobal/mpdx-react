import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { RentOwn } from './RentOwn';

const handleNext = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <RentOwn handleNext={handleNext} />
    </TestRouter>
  </ThemeProvider>
);

describe('RentOwn', () => {
  it('renders form and options', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();
  });

  it('should show validation error if continue is clicked without selecting an option', async () => {
    const { getByRole, findByText } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'CONTINUE' });
    continueButton.click();

    expect(
      await findByText('Your form is missing information.'),
    ).toBeInTheDocument();
  });

  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });
});
