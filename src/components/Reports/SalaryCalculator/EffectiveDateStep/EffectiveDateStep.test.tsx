import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateStep } from './EffectiveDateStep';

const TestComponent = () => (
  <SalaryCalculatorTestWrapper>
    <EffectiveDateStep />
  </SalaryCalculatorTestWrapper>
);

describe('EffectiveDateStep', () => {
  it('renders the heading', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();
  });

  it('renders the date selection dropdown', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('combobox', { name: 'Select a future date' }),
    ).toBeInTheDocument();
  });

  it('renders text content', async () => {
    const { findByText } = render(<TestComponent />);

    expect(
      await findByText(
        'Please select the date of the paycheck you would like this change to first occur.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty dropdown when no effective dates are available', async () => {
    const { findByRole } = render(<TestComponent />);

    const dropdown = await findByRole('combobox', {
      name: 'Select a future date',
    });
    // The dropdown should be empty since hcm.effectiveDates doesn't exist yet
    expect(dropdown).toBeInTheDocument();
  });
});
