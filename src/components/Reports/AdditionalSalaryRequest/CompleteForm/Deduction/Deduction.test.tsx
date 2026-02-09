import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { Deduction } from './Deduction';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
  traditionalDeductionPercentage?: number;
  rothDeductionPercentage?: number;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
  traditionalDeductionPercentage = 0,
  rothDeductionPercentage = 0,
}) => (
  <AdditionalSalaryRequestTestWrapper
    initialValues={initialValues}
    traditionalDeductionPercentage={traditionalDeductionPercentage}
    rothDeductionPercentage={rothDeductionPercentage}
  >
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

    const traditionalCheckbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Traditional deduction',
    });
    expect(traditionalCheckbox).toBeInTheDocument();
    expect(traditionalCheckbox).not.toBeChecked();

    const rothCheckbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Roth deduction',
    });
    expect(rothCheckbox).toBeInTheDocument();
    expect(rothCheckbox).not.toBeChecked();
  });

  it('displays the checkbox label text with percentage', async () => {
    const { findByText, getAllByText } = render(
      <TestWrapper
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    expect(
      await findByText(
        'Check this box if you would like 12% of your Additional Salary Request contributed to your Traditional 403(b).',
      ),
    ).toBeInTheDocument();
    expect(
      await findByText(
        'Check this box if you would like 8% of your Additional Salary Request contributed to your Roth 403(b).',
      ),
    ).toBeInTheDocument();

    expect(
      getAllByText(
        'This is your regular 403(b) percentage contribution as selected on your latest Salary Calculation Form.',
      ),
    ).toHaveLength(2);
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
    expect(zeroAmounts.length).toBeGreaterThanOrEqual(4);
  });

  it('calculates deduction when checkbox is checked', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByRole, findByText, getByLabelText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    const traditionalCheckbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Traditional deduction',
    });

    userEvent.click(traditionalCheckbox);

    await waitFor(() => {
      expect(traditionalCheckbox).toBeChecked();
    });

    const rothCheckbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Roth deduction',
    });

    userEvent.click(rothCheckbox);

    await waitFor(() => {
      expect(rothCheckbox).toBeChecked();
    });

    // 12% of $10,000 = $1,200
    // 8% of $10,000 = $800
    await waitFor(() => {
      expect(
        getByLabelText('Calculated traditional deduction amount'),
      ).toHaveTextContent('$1,200');
      expect(
        getByLabelText('Calculated roth deduction amount'),
      ).toHaveTextContent('$800');
    });
  });

  it('does not calculate deduction when checkbox is unchecked', () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByLabelText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    expect(
      getByLabelText('Calculated traditional deduction amount'),
    ).toHaveTextContent('$0');
    expect(
      getByLabelText('Calculated roth deduction amount'),
    ).toHaveTextContent('$0');
  });

  it('displays traditional403bContribution amount from form values', () => {
    const valuesWithContribution: CompleteFormValues = {
      ...defaultCompleteFormValues,
      traditional403bContribution: '5000',
    };

    const { getAllByText } = render(
      <TestWrapper initialValues={valuesWithContribution} />,
    );

    // The traditional403bContribution value should be displayed
    expect(getAllByText('$5,000').length).toBeGreaterThanOrEqual(1);
  });

  it('displays roth403bContribution amount from form values', () => {
    const valuesWithContribution: CompleteFormValues = {
      ...defaultCompleteFormValues,
      roth403bContribution: '3000',
    };

    const { getAllByText } = render(
      <TestWrapper initialValues={valuesWithContribution} />,
    );

    // The roth403bContribution value should be displayed
    expect(getAllByText('$3,000').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates total deduction as sum of calculated and traditional403bContribution + roth403bContribution', async () => {
    const valuesWithBoth: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '3000',
      roth403bContribution: '2000',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithBoth}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // 12% of ($10,000 + $3,000 + $2,000) = $1,800
    // 8% of ($10,000 + $3,000 + $2,000) = $1,200
    await waitFor(() => {
      expect(
        getByLabelText('Calculated traditional deduction amount'),
      ).toHaveTextContent('$1,800');
      expect(
        getByLabelText('Calculated roth deduction amount'),
      ).toHaveTextContent('$1,200');
    });

    // Total should be $3,000 + ($3,000 + $2,000) = $8,000
    await waitFor(() => {
      expect(getByLabelText('Total requested amount')).toHaveTextContent(
        '$8,000',
      );
    });
  });

  it('calculates percentage based on total of all salary fields', async () => {
    const valuesWithMultiple: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '2000',
      counselingNonMedical: '3000',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithMultiple}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // 12% of ($5,000 + $2,000 + $3,000) = 12% of $10,000 = $1,200
    // 8% of ($5,000 + $2,000 + $3,000) = 8% of $10,000 = $800
    await waitFor(() => {
      expect(
        getByLabelText('Calculated traditional deduction amount'),
      ).toHaveTextContent('$1,200');
      expect(
        getByLabelText('Calculated roth deduction amount'),
      ).toHaveTextContent('$800');
    });
  });

  it('does not include deductTaxDeferredPercent boolean in calculation', async () => {
    const valuesWithBoolean: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      deductTaxDeferredPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithBoolean}
        traditionalDeductionPercentage={12}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // Should calculate 12% of $10,000, not treat boolean as a number
    await waitFor(() => {
      expect(
        getByLabelText('Calculated traditional deduction amount'),
      ).toHaveTextContent('$1,200');
    });
  });

  it('does not include deductRothPercent boolean in calculation', async () => {
    const valuesWithBoolean: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      deductRothPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithBoolean}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/8%/);

    // Should calculate 8% of $10,000, not treat boolean as a number
    await waitFor(() => {
      expect(
        getByLabelText('Calculated roth deduction amount'),
      ).toHaveTextContent('$800');
    });
  });

  it('handles empty string values in calculation with deductTaxDeferredPercent', async () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '',
      counselingNonMedical: '',
      deductTaxDeferredPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithEmpty}
        traditionalDeductionPercentage={12}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // 12% of $5,000 = $600 (empty strings should be treated as 0)
    await waitFor(() => {
      expect(
        getByLabelText('Calculated traditional deduction amount'),
      ).toHaveTextContent('$600');
    });
  });

  it('handles empty string values in calculation with deductRothPercent', async () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '',
      counselingNonMedical: '',
      deductRothPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithEmpty}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/8%/);

    // 8% of $5,000 = $400 (empty strings should be treated as 0)
    await waitFor(() => {
      expect(
        getByLabelText('Calculated roth deduction amount'),
      ).toHaveTextContent('$400');
    });
  });

  it('updates total when traditional403bContribution changes', async () => {
    const { getByLabelText, rerender } = render(<TestWrapper />);

    expect(getByLabelText('Total requested amount')).toHaveTextContent('$0');

    const updatedValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      traditional403bContribution: '2500',
    };

    rerender(<TestWrapper initialValues={updatedValues} />);

    await waitFor(() => {
      expect(getByLabelText('Total requested amount')).toHaveTextContent(
        '$2,500',
      );
    });
  });

  it('updates total when roth403bContribution changes', async () => {
    const { getByLabelText, rerender } = render(<TestWrapper />);

    expect(getByLabelText('Total requested amount')).toHaveTextContent('$0');

    const updatedValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      roth403bContribution: '1500',
    };

    rerender(<TestWrapper initialValues={updatedValues} />);

    await waitFor(() => {
      expect(getByLabelText('Total requested amount')).toHaveTextContent(
        '$1,500',
      );
    });
  });

  it('traditional checkbox can be toggled on and off', async () => {
    const { getByRole } = render(<TestWrapper />);

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Traditional deduction',
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

  it('roth checkbox can be toggled on and off', async () => {
    const { getByRole } = render(<TestWrapper />);

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) Roth deduction',
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
