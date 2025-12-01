import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { CompleteFormValues } from '../CompleteForm';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';

const defaultValues: CompleteFormValues = {
  currentYearSalary: '0',
  previousYearSalary: '0',
  additionalSalary: '0',
  adoption: '0',
  contribution403b: '0',
  counseling: '0',
  healthcareExpenses: '0',
  babysitting: '0',
  childrenMinistryTrip: '0',
  childrenCollege: '0',
  movingExpense: '0',
  seminary: '0',
  housingDownPayment: '0',
  autoPurchase: '0',
  reimbursableExpenses: '0',
  defaultPercentage: false,
};

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultValues,
}) => (
  <AdditionalSalaryRequestTestWrapper>
    <Formik
      initialValues={initialValues}
      onSubmit={jest.fn()}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <AdditionalSalaryRequest formikProps={formikProps} />
        </Form>
      )}
    </Formik>
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequest', () => {
  it('renders the Additional Salary Request card', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Additional Salary Request')).toBeInTheDocument();
  });

  it('renders Category and Amount headers', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Category')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();
  });

  it('renders all input fields for categories', () => {
    const { getAllByRole } = render(<TestWrapper />);

    const inputs = getAllByRole('spinbutton');
    expect(inputs).toHaveLength(15);
  });

  it('displays Total Additional Salary Requested section', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Total Additional Salary Requested')).toBeInTheDocument();
  });

  it('shows $0 as total when all fields are empty', () => {
    const { getByTestId } = render(<TestWrapper />);

    expect(getByTestId('total-amount')).toHaveTextContent('$0');
  });

  it('calculates total from a single field', () => {
    const valuesWithAmount: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '5000',
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={valuesWithAmount} />,
    );

    expect(getByTestId('total-amount')).toHaveTextContent('$5,000');
  });

  it('calculates total from multiple fields', () => {
    const valuesWithMultiple: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '5000',
      adoption: '2000',
      counseling: '3000',
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={valuesWithMultiple} />,
    );

    expect(getByTestId('total-amount')).toHaveTextContent('$10,000');
  });

  it('updates total when user enters values', async () => {
    const { getAllByRole, getByTestId } = render(<TestWrapper />);

    const inputs = getAllByRole('spinbutton');

    userEvent.clear(inputs[0]);
    userEvent.type(inputs[0], '1000');
    userEvent.clear(inputs[1]);
    userEvent.type(inputs[1], '500');

    await waitFor(() => {
      expect(getByTestId('total-amount')).toHaveTextContent('$1,500');
    });
  });

  it('handles empty string values in calculation', () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '5000',
      adoption: '',
      counseling: '',
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={valuesWithEmpty} />,
    );

    expect(getByTestId('total-amount')).toHaveTextContent('$5,000');
  });

  it('does not include defaultPercentage boolean in total calculation', () => {
    const valuesWithBoolean: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '10000',
      defaultPercentage: true,
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={valuesWithBoolean} />,
    );

    expect(getByTestId('total-amount')).toHaveTextContent('$10,000');
  });

  it('displays all category labels', () => {
    const { getByText } = render(<TestWrapper />);

    // Check for a few key categories
    expect(
      getByText(
        'Additional salary not exceeding your Maximum Allowable Salary level',
      ),
    ).toBeInTheDocument();
    expect(getByText('Adoption')).toBeInTheDocument();
    expect(getByText('Moving Expense')).toBeInTheDocument();
  });

  it('displays placeholder text in input fields', () => {
    const { getAllByPlaceholderText } = render(<TestWrapper />);

    const placeholders = getAllByPlaceholderText('Enter amount');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('accepts numeric input in fields', async () => {
    const { getAllByRole } = render(<TestWrapper />);

    const inputs = getAllByRole('spinbutton');
    const firstInput = inputs[0];

    userEvent.clear(firstInput);
    userEvent.type(firstInput, '12345');

    await waitFor(() => {
      expect(firstInput).toHaveValue(12345);
    });
  });

  it('displays currency adornment on input fields', () => {
    const { getAllByRole } = render(<TestWrapper />);

    const inputs = getAllByRole('spinbutton');
    // Check that inputs have the currency adornment ($ sign)
    expect(inputs[0].parentElement?.textContent).toContain('$');
  });

  it('calculates total with all fields populated', () => {
    const allFieldsPopulated: CompleteFormValues = {
      currentYearSalary: '1000',
      previousYearSalary: '1000',
      additionalSalary: '1000',
      adoption: '1000',
      contribution403b: '1000',
      counseling: '1000',
      healthcareExpenses: '1000',
      babysitting: '1000',
      childrenMinistryTrip: '1000',
      childrenCollege: '1000',
      movingExpense: '1000',
      seminary: '1000',
      housingDownPayment: '1000',
      autoPurchase: '1000',
      reimbursableExpenses: '1000',
      defaultPercentage: false,
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={allFieldsPopulated} />,
    );

    // 15 fields * $1,000 = $15,000
    expect(getByTestId('total-amount')).toHaveTextContent('$15,000');
  });

  it('updates total when values change', () => {
    const { getByTestId, rerender } = render(<TestWrapper />);

    expect(getByTestId('total-amount')).toHaveTextContent('$0');

    const updatedValues: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '7500',
    };

    rerender(<TestWrapper initialValues={updatedValues} />);

    expect(getByTestId('total-amount')).toHaveTextContent('$7,500');
  });

  it('handles decimal values correctly', () => {
    const valuesWithDecimals: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '1000.50',
      adoption: '500.25',
    };

    const { getByTestId } = render(
      <TestWrapper initialValues={valuesWithDecimals} />,
    );

    expect(getByTestId('total-amount')).toHaveTextContent('$1,500.75');
  });

  it('renders dividers between categories', () => {
    const { container } = render(<TestWrapper />);

    const dividers = container.querySelectorAll('hr');
    // Should have dividers between categories plus one at the end
    expect(dividers.length).toBeGreaterThan(10);
  });

  it('displays all values from formik props', () => {
    const customValues: CompleteFormValues = {
      ...defaultValues,
      currentYearSalary: '100',
      previousYearSalary: '200',
      additionalSalary: '300',
    };

    const { getAllByRole } = render(
      <TestWrapper initialValues={customValues} />,
    );

    const inputs = getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(100);
    expect(inputs[1]).toHaveValue(200);
    expect(inputs[2]).toHaveValue(300);
  });

  it('calculates total with large numbers', () => {
    const largeValues: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '50000',
      housingDownPayment: '50000',
    };

    const { getByTestId } = render(<TestWrapper initialValues={largeValues} />);

    expect(getByTestId('total-amount')).toHaveTextContent('$100,000');
  });
});
