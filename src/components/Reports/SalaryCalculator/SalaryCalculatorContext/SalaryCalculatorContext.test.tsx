import { render, waitFor } from '@testing-library/react';
import { SalaryCalculatorContent } from '../SalaryCalculator';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy}>
    <SalaryCalculatorContent />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculator', () => {
  it('loads HCM data', async () => {
    render(<TestComponent />);

    await waitFor(() => expect(mutationSpy).toHaveGraphqlOperation('Hcm'));
  });

  it('loads salary calculation', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SalaryCalculation'),
    );
  });

  it('renders individual step items', async () => {
    const { getAllByRole } = render(<TestComponent />);

    expect(getAllByRole('listitem')).toHaveLength(5);
  });
});
