import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { NetAdditionalSalary } from './NetAdditionalSalary';

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
    <NetAdditionalSalary />
  </AdditionalSalaryRequestTestWrapper>
);

describe('NetAdditionalSalary', () => {
  it('renders the Net Additional Salary section', () => {
    const { getByText } = render(<TestWrapper />);

    expect(
      getByText('Net Additional Salary', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
  });

  it('displays the section labels', () => {
    const { getByText } = render(<TestWrapper />);

    expect(
      getByText('Net Additional Salary (Before Taxes)'),
    ).toBeInTheDocument();
    expect(
      getByText('Total Additional Salary Requested minus 403(b) Contribution'),
    ).toBeInTheDocument();
  });

  it('shows $0 when form is empty', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('$0')).toBeInTheDocument();
  });

  it('calculates net salary as total minus deduction when no 403b contribution', () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithSalary} />,
    );

    expect(getByText('$10,000')).toBeInTheDocument();
  });

  it('calculates net salary with traditional403bContribution deducted', async () => {
    const valuesWithContribution: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '2000',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithContribution} />,
    );

    // Total = $10,000 + $2,000 = $12,000
    // Deduction = $2,000 (traditional403bContribution)
    // Net = $12,000 - $2,000 = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });

  it('calculates net salary with percentage deduction when checkbox is checked', async () => {
    const valuesWithDeduction: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      deductTaxDeferredPercent: true,
    };

    const { findByText } = render(
      <TestWrapper
        initialValues={valuesWithDeduction}
        deductionPercentage={0.12}
      />,
    );

    // Net = $10,000 - (12% of $10,000) = $10,000 - $1,200 = $8,800
    expect(await findByText('$8,800')).toBeInTheDocument();
  });

  it('calculates net salary with both percentage and traditional403b deductions', async () => {
    const valuesWithBoth: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '1000',
      deductTaxDeferredPercent: true,
    };

    const { findByText } = render(
      <TestWrapper initialValues={valuesWithBoth} deductionPercentage={0.12} />,
    );

    // Total = $10,000 + $1,000 = $11,000
    // Calculated deduction = 12% of $11,000 = $1,320
    // Total deduction = $1,320 + $1,000 = $2,320
    // Net = $11,000 - $2,320 = $8,680
    expect(await findByText('$8,680')).toBeInTheDocument();
  });

  it('includes all salary fields in the total calculation', async () => {
    const valuesWithMultiple: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '2000',
      counselingNonMedical: '3000',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithMultiple} />,
    );

    // Total = $5,000 + $2,000 + $3,000 = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });

  it('handles empty string values in calculation', () => {
    const valuesWithEmpty: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '5000',
      adoption: '',
      counselingNonMedical: '',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithEmpty} />,
    );

    expect(getByText('$5,000')).toBeInTheDocument();
  });

  it('updates net salary when form values change', async () => {
    const { getByText, rerender } = render(<TestWrapper />);

    expect(getByText('$0')).toBeInTheDocument();

    const updatedValues: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '7500',
    };

    rerender(<TestWrapper initialValues={updatedValues} />);

    await waitFor(() => {
      expect(getByText('$7,500')).toBeInTheDocument();
    });
  });

  it('does not apply percentage deduction when checkbox is unchecked', () => {
    const valuesWithoutDeduction: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      deductTaxDeferredPercent: false,
    };

    const { getByText } = render(
      <TestWrapper
        initialValues={valuesWithoutDeduction}
        deductionPercentage={0.12}
      />,
    );

    // No percentage deduction, so net = total = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });
});
