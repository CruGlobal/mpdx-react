import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { Deduction } from './Deduction';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
  deductionPercentage?: number;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
  deductionPercentage = 0,
}) => (
  <AdditionalSalaryRequestTestWrapper
    initialValues={initialValues}
    deductionPercentage={deductionPercentage}
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

    const checkbox = getByRole('checkbox', {
      name: 'Use default Percentage for 403(b) deduction',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('displays the checkbox label text with percentage', async () => {
    const { findByText, getByText } = render(
      <TestWrapper deductionPercentage={12} />,
    );

    expect(
      await findByText(
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

  it('calculates deduction when checkbox is checked', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByRole, findByText, getByLabelText } = render(
      <TestWrapper initialValues={valuesWithSalary} deductionPercentage={12} />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

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
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByLabelText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        deductionPercentage={0.12}
      />,
    );

    expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
      '$0',
    );
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

  it('calculates total deduction as sum of calculated and traditional403bContribution', async () => {
    const valuesWithBoth: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '3000',
      deductTaxDeferredPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper initialValues={valuesWithBoth} deductionPercentage={12} />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

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

  it('calculates percentage based on total of all salary fields', async () => {
    const valuesWithMultiple: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '2000',
      counselingNonMedical: '3000',
      deductTaxDeferredPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper
        initialValues={valuesWithMultiple}
        deductionPercentage={12}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // 12% of ($5,000 + $2,000 + $3,000) = 12% of $10,000 = $1,200
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,200',
      );
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
        deductionPercentage={12}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // Should calculate 12% of $10,000, not treat boolean as a number
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$1,200',
      );
    });
  });

  it('handles empty string values in calculation', async () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '',
      counselingNonMedical: '',
      deductTaxDeferredPercent: true,
    };

    const { getByLabelText, findByText } = render(
      <TestWrapper initialValues={valuesWithEmpty} deductionPercentage={12} />,
    );

    // Wait for GraphQL data to load
    await findByText(/12%/);

    // 12% of $5,000 = $600 (empty strings should be treated as 0)
    await waitFor(() => {
      expect(getByLabelText('Calculated deduction amount')).toHaveTextContent(
        '$600',
      );
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
