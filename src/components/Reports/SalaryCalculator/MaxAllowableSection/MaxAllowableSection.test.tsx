import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { MaxAllowableStep } from './MaxAllowableSection';

const mutationSpy = jest.fn();

type TestComponentProps = Pick<
  SalaryCalculatorTestWrapperProps,
  'salaryRequestMock'
>;

const TestComponent: React.FC<TestComponentProps> = ({
  salaryRequestMock = {
    calculations: { calculatedCap: 75000 },
    spouseCalculations: { calculatedCap: 75000 },
  },
}) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={salaryRequestMock}
    onCall={mutationSpy}
  >
    <MaxAllowableStep />
  </SalaryCalculatorTestWrapper>
);

describe('MaxAllowableSection', () => {
  it('shows hard caps', async () => {
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
        <TestComponent
          salaryRequestMock={{
            calculations: { calculatedCap: 50000 },
            spouseCalculations: { calculatedCap: 60000 },
          }}
        />,
      );

      expect(await findByRole('cell', { name: '$50,000' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '$60,000' })).toBeInTheDocument();
    });
  });

  describe('when over combined cap', () => {
    it('should allow splitting max allowable amounts', async () => {
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(
        await findByRole('checkbox', {
          name: 'Check if you prefer to split your Combined Maximum Allowable Salary between you and Jane here before requesting your new salary.',
        }),
      );

      const input = getByRole('textbox', {
        name: 'John Maximum Allowable Salary',
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

    it('warns when input total exceeds the cap', async () => {
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(
        await findByRole('checkbox', { name: /Check if you prefer to split/ }),
      );

      const input = getByRole('textbox', {
        name: 'John Maximum Allowable Salary',
      });
      userEvent.clear(input);
      userEvent.type(input, '85000');
      input.blur();

      const spouseInput = getByRole('textbox', {
        name: 'Jane Maximum Allowable Salary',
      });
      userEvent.clear(spouseInput);
      userEvent.type(spouseInput, '85000');
      spouseInput.blur();

      expect(await findByRole('alert')).toHaveTextContent(
        'Your combined maximum allowable salary exceeds your maximum allowable salary of $125,000.00',
      );
    });
  });
});
