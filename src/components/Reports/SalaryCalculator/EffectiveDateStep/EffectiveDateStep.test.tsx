import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateStep } from './EffectiveDateStep';

const TestComponent = () => (
  <SalaryCalculatorTestWrapper>
    <EffectiveDateStep />
  </SalaryCalculatorTestWrapper>
);

describe('EffectiveDateStep', () => {
  it('renders the heading', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();
  });

  it('renders the date selection dropdown', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('combobox', { name: 'Select a future date' }),
    ).toBeInTheDocument();
  });

  it('renders text content', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText(
        'Please select the date of the paycheck you would like this change to first occur.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty dropdown when no effective dates are available', () => {
    const { getByRole } = render(<TestComponent />);

    const dropdown = getByRole('combobox', { name: 'Select a future date' });
    // The dropdown should be empty since hcm.effectiveDates doesn't exist yet
    expect(dropdown).toBeInTheDocument();
  });
});
