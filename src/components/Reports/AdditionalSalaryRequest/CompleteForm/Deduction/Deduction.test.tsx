import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequestTestWrapper } from '../../AdditionalSalaryRequestTestWrapper';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import { Deduction } from './Deduction';

interface TestWrapperProps {
  initialValues?: CompleteFormValues;
  traditionalDeductionPercentage?: number;
  rothDeductionPercentage?: number;
  pageType?: PageEnum;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  initialValues = defaultCompleteFormValues,
  traditionalDeductionPercentage = 0,
  rothDeductionPercentage = 0,
  pageType,
}) => (
  <AdditionalSalaryRequestTestWrapper
    initialValues={initialValues}
    traditionalDeductionPercentage={traditionalDeductionPercentage}
    rothDeductionPercentage={rothDeductionPercentage}
    pageType={pageType}
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

  it('renders contribution radio group', () => {
    const { getByRole } = render(<TestWrapper />);

    const noneRadio = getByRole('radio', {
      name: 'No 403(b) contribution - all funds go to my account',
    });
    expect(noneRadio).toBeInTheDocument();

    const rothRadio = getByRole('radio', {
      name: '100% of this request goes to my Roth 403(b)',
    });
    expect(rothRadio).toBeInTheDocument();

    const traditionalRadio = getByRole('radio', {
      name: '100% of this request goes to my Traditional 403(b)',
    });
    expect(traditionalRadio).toBeInTheDocument();

    const standardRadio = getByRole('radio', {
      name: /Apply my regular 403\(b\) percentages/i,
    });
    expect(standardRadio).toBeInTheDocument();
  });

  it('displays the standard radio label with default percentages', async () => {
    const { findByRole } = render(
      <TestWrapper
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    const standardRadio = await findByRole('radio', {
      name: 'Apply my regular 403(b) percentages (12.00% Traditional / 8.00% Roth)',
    });
    expect(standardRadio).toBeInTheDocument();
  });

  it('rounds percentages in the standard radio label', async () => {
    const { findByRole } = render(
      <TestWrapper
        traditionalDeductionPercentage={12.249}
        rothDeductionPercentage={7.00000001}
      />,
    );

    const standardRadio = await findByRole('radio', {
      name: 'Apply my regular 403(b) percentages (12.25% Traditional / 7.00% Roth)',
    });
    expect(standardRadio).toBeInTheDocument();
  });

  it('displays total deduction section', () => {
    const { getByText } = render(<TestWrapper />);

    expect(getByText('Total 403(b) Deduction')).toBeInTheDocument();
  });

  it('shows $0.00 for total deduction amount when form is empty', () => {
    const { getAllByText } = render(<TestWrapper />);

    const zeroAmounts = getAllByText('$0.00');
    expect(zeroAmounts.length).toBe(1);
  });

  it('shows $0.00 when none selected', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByRole, findByText, getByText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12.00%/);

    const noneRadio = getByRole('radio', {
      name: 'No 403(b) contribution - all funds go to my account',
    });

    userEvent.click(noneRadio);

    await waitFor(() => {
      expect(noneRadio).toBeChecked();
    });

    await waitFor(() => {
      expect(getByText('$0.00')).toBeInTheDocument();
    });
  });

  it('displays preselected none radio', () => {
    const { getByRole } = render(
      <TestWrapper initialValues={defaultCompleteFormValues} />,
    );

    const noneRadio = getByRole('radio', {
      name: 'No 403(b) contribution - all funds go to my account',
    });
    expect(noneRadio).toBeChecked();
  });

  it('calculates deduction when pretax selected', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByRole, findByText, getByText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/12.00%/);

    const traditionalRadio = getByRole('radio', {
      name: '100% of this request goes to my Traditional 403(b)',
    });

    userEvent.click(traditionalRadio);

    await waitFor(() => {
      expect(traditionalRadio).toBeChecked();
    });

    await waitFor(() => {
      expect(getByText('$10,000.00')).toBeInTheDocument();
    });
  });

  it('calculates deduction when roth selected', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { getByRole, findByText, getByText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    // Wait for GraphQL data to load
    await findByText(/8.00%/);

    const rothRadio = getByRole('radio', {
      name: '100% of this request goes to my Roth 403(b)',
    });

    userEvent.click(rothRadio);

    await waitFor(() => {
      expect(rothRadio).toBeChecked();
    });

    await waitFor(() => {
      expect(getByText('$10,000.00')).toBeInTheDocument();
    });
  });

  it('calculates deduction when standard selected', async () => {
    const valuesWithSalary: CompleteFormValues = {
      ...defaultCompleteFormValues,
      additionalSalaryWithinMax: '10000',
    };

    const { findByRole, getByText } = render(
      <TestWrapper
        initialValues={valuesWithSalary}
        traditionalDeductionPercentage={12}
        rothDeductionPercentage={8}
      />,
    );

    const standardRadio = await findByRole('radio', {
      name: 'Apply my regular 403(b) percentages (12.00% Traditional / 8.00% Roth)',
    });

    userEvent.click(standardRadio);

    await waitFor(() => {
      expect(standardRadio).toBeChecked();
    });

    // Traditional: $10,000 * 12% = $1,200
    // Roth: $10,000 * 8% = $800
    // Total: $2,000
    await waitFor(() => {
      expect(getByText('$2,000.00')).toBeInTheDocument();
    });
  });

  it('disables radio buttons in view mode', () => {
    const { getAllByRole } = render(<TestWrapper pageType={PageEnum.View} />);

    const radios = getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('does not show validation error before submit', () => {
    const { queryByText } = render(<TestWrapper />);

    expect(
      queryByText(
        'Please select how you would like to contribute to your 403(b).',
      ),
    ).not.toBeInTheDocument();
  });
});
