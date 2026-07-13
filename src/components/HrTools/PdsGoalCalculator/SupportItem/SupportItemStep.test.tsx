import React from 'react';
import { render } from '@testing-library/react';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  HcmUserMock,
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { SupportItemStep } from './SupportItemStep';

interface Props {
  calculationMock?: PdsGoalCalculationMock;
  hcmUserMock?: HcmUserMock | null;
}

const TestComponent: React.FC<Props> = ({ calculationMock, hcmUserMock }) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={calculationMock}
    hcmUserMock={hcmUserMock}
  >
    <SupportItemStep />
  </PdsGoalCalculatorTestWrapper>
);

const reimbursableZero = {
  ministryCellPhone: 0,
  ministryInternet: 0,
  mpdNewsletter: 0,
  mpdMiscellaneous: 0,
  accountTransfers: 0,
  otherMonthlyReimbursements: 0,
  conferenceRetreatCosts: 0,
  ministryTravelMeals: 0,
  otherAnnualReimbursements: 0,
};

const fullTimeMock: PdsGoalCalculationMock = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
  ...reimbursableZero,
};

const partTimeMock: PdsGoalCalculationMock = {
  ...fullTimeMock,
  status: DesignationSupportStatus.PartTime,
  benefits: 0,
};

describe('SupportItemStep', () => {
  it('renders the Support Items heading', async () => {
    const { findByRole } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    expect(
      await findByRole('heading', { name: 'Support Items' }),
    ).toBeInTheDocument();
  });

  it('renders a single combined breakdown grid without Salary/Other section headings', async () => {
    const { findByRole, getAllByRole, queryByRole } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    expect(
      await findByRole('grid', { name: 'Support items breakdown' }),
    ).toBeInTheDocument();
    expect(getAllByRole('grid')).toHaveLength(1);

    expect(queryByRole('heading', { name: 'Salary' })).not.toBeInTheDocument();
    expect(queryByRole('heading', { name: 'Other' })).not.toBeInTheDocument();
  });

  it('renders salary and other rows together for a full-time user', async () => {
    const { findByTestId, getByTestId, getByRole, queryByTestId } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    await findByTestId('subtotal');

    // Salary rows: 60000 / 12 = 5000 gross monthly pay
    expect(getByTestId('gross-monthly-pay')).toHaveTextContent('$5,000');
    expect(getByTestId('employer-fica')).toBeInTheDocument();

    // Reimbursable floor of $300 (no reimbursable fields set)
    expect(getByTestId('reimbursable-expenses')).toHaveTextContent('$300');

    // 403b = 0 (no contribution percentages set)
    expect(getByTestId('403b-contributions')).toHaveTextContent('$0');

    // Benefits for full-time
    expect(getByTestId('benefits')).toHaveTextContent('$1,500');

    // Work comp should NOT appear for full-time
    expect(queryByTestId('work-comp')).not.toBeInTheDocument();

    // Subtotal, attrition, credit card fees, and assessment should all render
    expect(getByTestId('attrition')).toBeInTheDocument();
    expect(getByTestId('credit-card-fees')).toBeInTheDocument();
    expect(getByTestId('assessment')).toBeInTheDocument();

    expect(
      getByRole('gridcell', { name: 'Benefits for Full-time' }),
    ).toBeInTheDocument();
  });

  it('does not render formula math detail under the categories', async () => {
    const { findByTestId, queryByRole } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    await findByTestId('subtotal');

    expect(queryByRole('gridcell', { name: /÷/ })).not.toBeInTheDocument();
    expect(queryByRole('gridcell', { name: /×/ })).not.toBeInTheDocument();
  });

  it('renders work comp row instead of benefits for a part-time user', async () => {
    const { findByTestId, getByTestId, getByRole, queryByTestId } = render(
      <TestComponent calculationMock={partTimeMock} />,
    );

    await findByTestId('subtotal');

    expect(getByTestId('work-comp')).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Work Comp for Part-time' }),
    ).toBeInTheDocument();
    expect(queryByTestId('benefits')).not.toBeInTheDocument();
  });

  it('includes 403b contributions when the user has contribution percentages', async () => {
    const { findByTestId, getByTestId } = render(
      <TestComponent
        calculationMock={fullTimeMock}
        hcmUserMock={{
          fourOThreeB: {
            currentTaxDeferredContributionPercentage: 5,
            currentRothContributionPercentage: 3,
          },
        }}
      />,
    );

    await findByTestId('403b-contributions');

    // grossMonthlyPay = 60000/12 = 5000
    // 403b percentage = (5 + 3) / 100 = 0.08
    // 403b contributions = 5000 * 0.08 = 400
    expect(getByTestId('403b-contributions')).toHaveTextContent('$400');
  });

  it('hides reimbursable expenses and 403b contributions rows for the simple form', async () => {
    const simpleMock: PdsGoalCalculationMock = {
      ...fullTimeMock,
      formType: DesignationSupportFormType.Simple,
    };

    const { findByTestId, queryByTestId } = render(
      <TestComponent calculationMock={simpleMock} />,
    );

    await findByTestId('subtotal');

    expect(queryByTestId('reimbursable-expenses')).not.toBeInTheDocument();
    expect(queryByTestId('403b-contributions')).not.toBeInTheDocument();
  });

  it('applies border and bold row classes to the appropriate rows', async () => {
    const { findByTestId, container } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    await findByTestId('subtotal');

    expect(container.querySelector('[data-id="subtotal"]')).toHaveClass(
      'top-border',
      'bottom-border',
      'bold-row',
    );

    const attritionRow = container.querySelector('[data-id="attrition"]');
    expect(attritionRow).toHaveClass('bold-row');
    expect(attritionRow).not.toHaveClass('top-border');
    expect(attritionRow).not.toHaveClass('bottom-border');

    const payRateRow = container.querySelector('[data-id="pay-rate"]');
    expect(payRateRow).not.toHaveClass('bold-row');
    expect(payRateRow).not.toHaveClass('top-border');
    expect(payRateRow).not.toHaveClass('bottom-border');
  });

  it('renders no grid when constants are missing', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeMock}
        constantsMock={{ mpdGoalMiscConstants: [] }}
      >
        <SupportItemStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Support Items' }),
    ).toBeInTheDocument();
    expect(queryByRole('grid')).not.toBeInTheDocument();
  });
});
