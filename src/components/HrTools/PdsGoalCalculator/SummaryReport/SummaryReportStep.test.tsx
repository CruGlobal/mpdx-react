import React from 'react';
import { render } from '@testing-library/react';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { SummaryReportStep } from './SummaryReportStep';

const calculationMock: PdsGoalCalculationMock = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
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

describe('SummaryReportStep', () => {
  it('renders the header cards and data table', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={calculationMock}>
        <SummaryReportStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Your Goal' }),
    ).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('grid', { name: 'PDS Goal Summary' })).toBeInTheDocument();
  });

  it('caps the progress percentage at 100% when supportRaised exceeds overallTotal', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={calculationMock}
        supportRaisedMock={999999}
      >
        <SummaryReportStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('heading', { name: '100%' })).toBeInTheDocument();
  });
});
