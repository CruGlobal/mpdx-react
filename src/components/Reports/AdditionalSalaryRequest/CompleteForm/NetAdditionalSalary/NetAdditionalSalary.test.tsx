import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { NetAdditionalSalary } from './NetAdditionalSalary';

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
      roth403bContribution: '0',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithContribution} />,
    );

    // Total = $10,000 + $2,000 = $12,000
    // Deduction = $2,000 (traditional403bContribution)
    // Net = $12,000 - $2,000 = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });

  it('calculates net salary with roth403bContribution deducted', async () => {
    const valuesWithRothContribution: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '0',
      roth403bContribution: '1500',
    };

    const { getByText } = render(
      <TestWrapper initialValues={valuesWithRothContribution} />,
    );

    // Total = $10,000 + $1,500 = $11,500
    // Deduction = $1,500 (roth403bContribution)
    // Net = $11,500 - $1,500 = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });

  it('calculates net salary with percentage deduction when checkbox is checked', async () => {
    const valuesWithDeduction: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    };

    const { findByText } = render(
      <TestWrapper
        initialValues={valuesWithDeduction}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Net = $10,000 - (12% of $10,000 + 8% of $10,000) = $10,000 - $1,200 - $800 = $8,000
    expect(await findByText('$8,000')).toBeInTheDocument();
  });

  it('calculates net salary with both percentage and traditional403b deductions', async () => {
    const valuesWithBoth: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      traditional403bContribution: '1000',
      roth403bContribution: '100',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    };

    const { findByText } = render(
      <TestWrapper
        initialValues={valuesWithBoth}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Total = $10,000 + $1,000 + $100 = $11,100
    // Calculated deduction = 12% of $11,100 + 8% of $11,100 = $1,332 + $888 = $2,220
    // Total deduction = $2,220 + $1,000 + $100 = $3,320
    // Net = $11,100 - $3,320 = $7,780
    expect(await findByText('$7,780')).toBeInTheDocument();
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
      deductRothPercent: false,
    };

    const { getByText } = render(
      <TestWrapper
        initialValues={valuesWithoutDeduction}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // No percentage deduction, so net = total = $10,000
    expect(getByText('$10,000')).toBeInTheDocument();
  });
});
