import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ElectionType403bEnum } from 'src/graphql/types.generated';
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

  it('calculates net salary with standard contribution selected', async () => {
    const valuesWithDeduction: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      electionType403b: ElectionType403bEnum.Standard,
    };

    const { findByText } = render(
      <TestWrapper
        initialValues={valuesWithDeduction}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Traditional = 12% of $10,000 = $1,200
    // Roth = 8% of ($10,000 - $1,200) = 8% of $8,800 = $704
    // Net = $10,000 - $1,200 - $704 = $8,096
    expect(await findByText('$8,096')).toBeInTheDocument();
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

  it('does not apply percentage deduction when no contribution is selected', () => {
    const valuesWithoutDeduction: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
      electionType403b: ElectionType403bEnum.None,
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
