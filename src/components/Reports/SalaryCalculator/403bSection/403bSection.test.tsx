import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { FourOhThreeBSection } from './403bSection';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy}>
    <FourOhThreeBSection />
  </SalaryCalculatorTestWrapper>
);

describe('403bSection', () => {
  it('should render retirement contribution percentages', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('cell', { name: '12.00%' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '8.00%' })).toBeInTheDocument();
    expect(getByRole('cell', { name: '$47' })).toBeInTheDocument();
  });
});
