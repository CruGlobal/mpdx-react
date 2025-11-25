import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateStep } from './EffectiveDateStep';

describe('EffectiveDateStep', () => {
  it('renders the heading', () => {
    const { getByRole } = render(
      <SalaryCalculatorTestWrapper>
        <EffectiveDateStep />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      getByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();
  });

  it('renders the date selection dropdown', () => {
    const { getByRole } = render(
      <SalaryCalculatorTestWrapper>
        <EffectiveDateStep />
      </SalaryCalculatorTestWrapper>,
    );

    expect(
      getByRole('combobox', { name: 'Select a future date' }),
    ).toBeInTheDocument();
  });
});
