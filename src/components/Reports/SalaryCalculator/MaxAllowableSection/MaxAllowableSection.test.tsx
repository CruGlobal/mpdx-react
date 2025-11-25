import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { MaxAllowableStep, MaxAllowableStepProps } from './MaxAllowableSection';

const mutationSpy = jest.fn();

const TestComponent: React.FC<MaxAllowableStepProps> = (props) => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy}>
    <MaxAllowableStep {...props} />
  </SalaryCalculatorTestWrapper>
);

describe('MaxAllowableSection', () => {
  it('loads cap constants', async () => {
    const { findByText } = render(<TestComponent />);

    expect(
      await findByText(
        'Maximum Allowable Salary may not exceed $80,000 for an individual and $125,000 combined',
        { exact: false },
      ),
    ).toBeInTheDocument();
  });

  describe('when not over combined cap', () => {
    it('should render max allowable amounts', async () => {
      const { findByRole, getByRole } = render(
        <TestComponent maxSalary={50000} spouseMaxSalary={60000} />,
      );

      expect(getByRole('cell', { name: '$50,000' })).toBeInTheDocument();
      expect(await findByRole('cell', { name: '$60,000' })).toBeInTheDocument();
    });
  });

  describe('when over combined cap', () => {
    it('should render max allowable amounts', async () => {
      const { findByRole } = render(
        <TestComponent maxSalary={75000} spouseMaxSalary={75000} />,
      );

      const input = await findByRole('textbox', {
        name: 'Maximum Allowable Salary',
      });
      userEvent.clear(input);
      userEvent.type(input, '85000');
      input.blur();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateSalaryCalculation', {
          input: {
            attributes: {
              salaryCap: 85000,
            },
          },
        }),
      );
    });
  });

  it('warns when input total exceeds the cap', async () => {
    const { findByRole } = render(
      <TestComponent maxSalary={75000} spouseMaxSalary={75000} />,
    );

    const input = await findByRole('textbox', {
      name: 'Maximum Allowable Salary',
    });
    userEvent.clear(input);
    userEvent.type(input, '85000');
    input.blur();

    const spouseInput = await findByRole('textbox', {
      name: 'Spouse Maximum Allowable Salary',
    });
    userEvent.clear(spouseInput);
    userEvent.type(spouseInput, '85000');
    spouseInput.blur();

    expect(await findByRole('alert')).toHaveTextContent(
      'Your combined maximum allowable salary exceeds your maximum allowable salary of $150,000.00',
    );
  });
});
