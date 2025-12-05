import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { Deduction } from './Deduction';

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
  <AdditionalSalaryRequestTestWrapper initialValues={initialValues}>
    <Deduction />
  </AdditionalSalaryRequestTestWrapper>
);

describe('Deduction', () => {
  it('renders the 403(b) Deduction section', () => {
    const { getByText } = render(<TestWrapper />);

    expect(
      getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
  });

  it('renders the default percentage checkbox', () => {
    const { getByRole } = render(<TestWrapper />);

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) deduction',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('displays the checkbox label text', () => {
    const { getByText } = render(<TestWrapper />);

    expect(
      getByText(
        'Check this box if you would like 12% of the amount requested above deducted from this Additional Salary Request.',
      ),
    ).toBeInTheDocument();
    expect(
      getByText(
        'This is your regular 403(b) percentage contribution as selected on your latest Salary Calculation Form.',
      ),
    ).toBeInTheDocument();
  });

  it('displays all three sections', () => {
    const { getByText } = render(<TestWrapper />);

    expect(
      getByText('403(b) Contribution Requested as Additional Salary'),
    ).toBeInTheDocument();
    expect(getByText('Total 403(b) Deduction')).toBeInTheDocument();
  });

  it('shows $0 for all amounts when form is empty', () => {
    const { getAllByText } = render(<TestWrapper />);

    const zeroAmounts = getAllByText('$0');
    expect(zeroAmounts.length).toBeGreaterThanOrEqual(3);
  });

  it('calculates 12% deduction when checkbox is checked', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '10000',
    };

    const { getByRole, getByLabelText } = render(
      <TestWrapper initialValues={valuesWithSalary} />,
    );

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) deduction',
    });

    userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    // 12% of $10,000 = $1,200
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,200',
      );
    });
  });

  it('does not calculate deduction when checkbox is unchecked', () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '10000',
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithSalary} />,
    );

    expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
      '$0',
    );
  });

  it('displays contribution403b amount from form values', () => {
    const valuesWithContribution: CompleteFormValues = {
      ...defaultValues,
      contribution403b: '5000',
    };

    const { getAllByText } = render(
      <TestWrapper initialValues={valuesWithContribution} />,
    );

    // The contribution403b value should be displayed
    expect(getAllByText('$5,000').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates total deduction as sum of calculated and contribution403b', async () => {
    const valuesWithBoth: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '10000',
      contribution403b: '3000',
      defaultPercentage: true,
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithBoth} />,
    );

    // 12% of ($10,000 + $3,000) = $1,560
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,560',
      );
    });

    // Total should be $1,560 + $3,000 = $4,560
    await waitFor(() => {
      expect(getByLabelText('Total requested amount')).toHaveTextContent(
        '$4,560',
      );
    });
  });

  it('calculates 12% based on total of all salary fields', async () => {
    const valuesWithMultiple: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '5000',
      adoption: '2000',
      counseling: '3000',
      defaultPercentage: true,
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithMultiple} />,
    );

    // 12% of ($5,000 + $2,000 + $3,000) = 12% of $10,000 = $1,200
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,200',
      );
    });
  });

  it('does not include defaultPercentage boolean in calculation', async () => {
    const valuesWithBoolean: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '10000',
      defaultPercentage: true,
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithBoolean} />,
    );

    // Should calculate 12% of $10,000, not treat boolean as a number
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,200',
      );
    });
  });

  it('handles empty string values in calculation', async () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultValues,
      additionalSalary: '5000',
      adoption: '',
      counseling: '',
      defaultPercentage: true,
    };

    const { getByLabelText } = render(
      <TestWrapper initialValues={valuesWithEmpty} />,
    );

    // 12% of $5,000 = $600 (empty strings should be treated as 0)
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$600',
      );
    });
  });

  it('updates total when contribution403b changes', async () => {
    const { getByLabelText, rerender } = render(<TestWrapper />);

    expect(getByLabelText('Total requested amount')).toHaveTextContent('$0');

    const updatedValues: CompleteFormValues = {
      ...defaultValues,
      contribution403b: '2500',
    };

    rerender(<TestWrapper initialValues={updatedValues} />);

    await waitFor(() => {
      expect(getByLabelText('Total requested amount')).toHaveTextContent(
        '$2,500',
      );
    });
  });

  it('checkbox can be toggled on and off', async () => {
    const { getByRole } = render(<TestWrapper />);

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) deduction',
    });

    expect(checkbox).not.toBeChecked();

    userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });
});
