import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
}) => (
  <AdditionalSalaryRequestTestWrapper initialValues={initialValues}>
    <AdditionalSalaryRequest />
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
      expect(inputs).toHaveLength(15);

      // Verify key category labels are present
      expect(
        getByText(
          'Additional salary not exceeding your Maximum Allowable Salary level',
        ),
      ).toBeInTheDocument();
      expect(getByText('Adoption')).toBeInTheDocument();
      expect(getByText('Moving Expense')).toBeInTheDocument();
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
        deductTwelvePercent: true,
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
        totalAdditionalSalaryRequested: '1000000',
      };

      const { getByText } = render(
        <TestWrapper initialValues={invalidValues} />,
      );

      await waitFor(() => {
        expect(getByText('Exceeds account balance.')).toBeInTheDocument();
      });
    });

    it('shows validation error for individual field', async () => {
      const invalidValues: CompleteFormValues = {
        ...defaultCompleteFormValues,
        adoption: '',
      };

      const { findByText, findByRole } = render(
        <TestWrapper initialValues={invalidValues} />,
      );

      const row = await findByRole('row', { name: /Adoption/i });
      const input = within(row).getByPlaceholderText(/\$0/i);

      userEvent.type(input, '100');
      expect(input).toHaveValue('100');
      await userEvent.clear(input);
      expect(input).toHaveValue('');

      input.focus();
      await userEvent.tab();

      expect(await findByText('Required field.')).toBeInTheDocument();
    });
  });
});
