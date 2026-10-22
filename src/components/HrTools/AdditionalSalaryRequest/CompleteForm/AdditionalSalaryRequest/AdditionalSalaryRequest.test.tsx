import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormikContext } from 'formik';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
}

// Exposes the total error so a test can wait for validation before asserting it is hidden
const SubmitButton: React.FC = () => {
  const { submitForm, errors } = useFormikContext<CompleteFormValues>();
  return (
    <button
      onClick={submitForm}
      data-total-error={!!errors.totalAdditionalSalaryRequested}
    >
      Submit
    </button>
  );
};

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
}) => (
  <AdditionalSalaryRequestTestWrapper initialValues={initialValues}>
    <AdditionalSalaryRequest />
    <SubmitButton />
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequest', () => {
  describe('rendering', () => {
    it('renders the card with title and headers', () => {
      const { getByText } = render(<TestWrapper />);

      expect(
        getByText('Additional Salary Request', {
          selector: '.MuiCardHeader-title',
        }),
      ).toBeInTheDocument();
      expect(getByText('Category')).toBeInTheDocument();
      expect(getByText('Amount')).toBeInTheDocument();
    });

    it('renders all category input fields with labels', () => {
      const { getAllByRole, getByText } = render(<TestWrapper />);

      const inputs = getAllByRole('textbox');
      expect(inputs).toHaveLength(14);

      // Verify key category labels are present
      expect(
        getByText(
          'Additional salary not exceeding your Maximum Allowable Salary level',
        ),
      ).toBeInTheDocument();
      expect(getByText('Adoption')).toBeInTheDocument();
      expect(getByText('Moving Expense')).toBeInTheDocument();
    });

    it('names each amount input by its category and asks for a decimal keypad', () => {
      const { getAllByRole, getByRole } = render(<TestWrapper />);

      const inputs = getAllByRole('textbox');
      expect(inputs).toHaveLength(14);
      inputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
        expect(input).toHaveAttribute('inputmode', 'decimal');
      });
      expect(getByRole('textbox', { name: 'Adoption' })).toBeInTheDocument();
    });

    it('displays Total Additional Salary Requested section', () => {
      const { getByText, getByTestId } = render(<TestWrapper />);

      expect(
        getByText('Total Additional Salary Requested'),
      ).toBeInTheDocument();
      expect(getByTestId('total-amount')).toBeInTheDocument();
    });
  });

  describe('total calculations', () => {
    it('shows $0 when all fields are empty', () => {
      const { getByTestId } = render(<TestWrapper />);

      expect(getByTestId('total-amount')).toHaveTextContent('$0');
    });

    it('calculates total from multiple fields correctly', () => {
      const valuesWithMultiple: CompleteFormValues = {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '5000',
        adoption: '2000',
        counselingNonMedical: '3000',
      };

      const { getByTestId } = render(
        <TestWrapper initialValues={valuesWithMultiple} />,
      );

      expect(getByTestId('total-amount')).toHaveTextContent('$10,000');
    });

    it('handles decimal values correctly', () => {
      const valuesWithDecimals: CompleteFormValues = {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '1000.50',
        adoption: '500.25',
      };

      const { getByTestId } = render(
        <TestWrapper initialValues={valuesWithDecimals} />,
      );

      expect(getByTestId('total-amount')).toHaveTextContent('$1,500.75');
    });

    it('ignores non-numeric fields in total calculation', () => {
      const valuesWithBoolean: CompleteFormValues = {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '10000',
        phoneNumber: '555-1234',
      };

      const { getByTestId } = render(
        <TestWrapper initialValues={valuesWithBoolean} />,
      );

      expect(getByTestId('total-amount')).toHaveTextContent('$10,000');
    });
  });

  describe('form values display', () => {
    it('displays initial values from formik in currency format', async () => {
      const customValues: CompleteFormValues = {
        ...defaultCompleteFormValues,
        currentYearSalaryNotReceived: '100',
        previousYearSalaryNotReceived: '200',
        additionalSalaryWithinMax: '300',
      };

      const { getAllByRole } = render(
        <TestWrapper initialValues={customValues} />,
      );

      await waitFor(() => {
        const inputs = getAllByRole('textbox');
        expect(inputs[0]).toHaveValue('$100.00');
        expect(inputs[1]).toHaveValue('$200.00');
        expect(inputs[2]).toHaveValue('$300.00');
      });
    });

    it('updates total when initial values change via rerender', () => {
      const { getByTestId, rerender } = render(<TestWrapper />);

      expect(getByTestId('total-amount')).toHaveTextContent('$0');

      const updatedValues: CompleteFormValues = {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '7500',
      };

      rerender(<TestWrapper initialValues={updatedValues} />);

      expect(getByTestId('total-amount')).toHaveTextContent('$7,500');
    });

    it('shows validation error for asr total amount', async () => {
      const invalidValues: CompleteFormValues = {
        ...defaultCompleteFormValues,
        movingExpense: '1000000',
        totalAdditionalSalaryRequested: '1000000',
      };

      const { getByText } = render(
        <TestWrapper initialValues={invalidValues} />,
      );

      await waitFor(() => {
        expect(
          getByText('Exceeds account balance plus deficit limit.'),
        ).toBeInTheDocument();
      });
    });

    it('waits for a submit before flagging a $0 total', async () => {
      const { getByRole, findByText, queryByText } = render(<TestWrapper />);
      const message =
        'Enter an amount in at least one category before submitting.';
      const submit = getByRole('button', { name: 'Submit' });

      await waitFor(() =>
        expect(submit).toHaveAttribute('data-total-error', 'true'),
      );
      expect(queryByText(message)).not.toBeInTheDocument();

      userEvent.click(submit);

      expect(await findByText(message)).toBeInTheDocument();
    });
  });
});
