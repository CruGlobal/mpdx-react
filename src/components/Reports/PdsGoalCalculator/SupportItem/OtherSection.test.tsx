import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  HcmUserMock,
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { OtherSection } from './OtherSection';

interface Props {
  calculationMock?: PdsGoalCalculationMock;
  hcmUserMock?: HcmUserMock | null;
}

const TestComponent: React.FC<Props> = ({ calculationMock, hcmUserMock }) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={calculationMock}
    hcmUserMock={hcmUserMock}
  >
    <OtherSection />
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
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.PartTime,
  benefits: 0,
  ...reimbursableZero,
};

describe('OtherSection', () => {
  it('renders the Other heading', async () => {
    const { findByRole } = render(
      <TestComponent calculationMock={fullTimeMock} />,
    );

    expect(await findByRole('heading', { name: 'Other' })).toBeInTheDocument();
  });

  describe('full-time breakdown', () => {
    it('renders benefits row and all expected rows for a full-time user', async () => {
      const { findByTestId, getByTestId, getByRole, queryByTestId } = render(
        <TestComponent calculationMock={fullTimeMock} />,
      );

      await findByTestId('other-subtotal');

      // Reimbursable floor of $300 (no reimbursable fields set)
      expect(getByTestId('other-reimbursable-expenses')).toHaveTextContent(
        '$300',
      );

      // 403b = 0 (no contribution percentages set)
      expect(getByTestId('other-403b-contributions')).toHaveTextContent('$0');

      // Benefits for full-time
      expect(getByTestId('other-benefits')).toHaveTextContent('$1,500');

      // Work comp should NOT appear for full-time
      expect(queryByTestId('other-work-comp')).not.toBeInTheDocument();

      // Subtotal, attrition, credit card fees, and assessment should all render
      expect(getByTestId('other-subtotal')).toBeInTheDocument();
      expect(getByTestId('other-attrition')).toBeInTheDocument();
      expect(getByTestId('other-credit-card-fees')).toBeInTheDocument();
      expect(getByTestId('other-assessment')).toBeInTheDocument();

      // Benefits row should be present in the grid
      expect(
        getByRole('gridcell', { name: 'Benefits for Full-time' }),
      ).toBeInTheDocument();
    });
  });

  describe('part-time breakdown', () => {
    it('renders work comp row instead of benefits for a part-time user', async () => {
      const { findByTestId, getByTestId, getByRole, queryByTestId } = render(
        <TestComponent calculationMock={partTimeMock} />,
      );

      await findByTestId('other-subtotal');

      // Work comp should appear for part-time
      expect(getByTestId('other-work-comp')).toBeInTheDocument();
      expect(
        getByRole('gridcell', { name: 'Work Comp for Part-time' }),
      ).toBeInTheDocument();

      // Benefits should NOT appear for part-time
      expect(queryByTestId('other-benefits')).not.toBeInTheDocument();
    });
  });

  describe('null status', () => {
    it('renders neither benefits nor work comp when status is null', async () => {
      const nullStatusMock: PdsGoalCalculationMock = {
        ...fullTimeMock,
        status: null,
      };

      const { findByTestId, queryByTestId } = render(
        <TestComponent calculationMock={nullStatusMock} />,
      );

      await findByTestId('other-subtotal');

      // When status is null, both isFullTime and isPartTime are false,
      // so neither the benefits row nor the work comp row should render.
      expect(queryByTestId('other-benefits')).not.toBeInTheDocument();
      expect(queryByTestId('other-work-comp')).not.toBeInTheDocument();
    });
  });

  describe('403b contributions', () => {
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

      await findByTestId('other-403b-contributions');

      // grossMonthlyPay = 60000/12 = 5000
      // 403b percentage = (5 + 3) / 100 = 0.08
      // 403b contributions = 5000 * 0.08 = 400
      expect(getByTestId('other-403b-contributions')).toHaveTextContent('$400');
    });
  });

  it('renders nothing when constants are missing', async () => {
    const { container, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={fullTimeMock}
        constantsMock={{ mpdGoalMiscConstants: [] }}
      >
        <OtherSection />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'Other' }),
      ).not.toBeInTheDocument(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
