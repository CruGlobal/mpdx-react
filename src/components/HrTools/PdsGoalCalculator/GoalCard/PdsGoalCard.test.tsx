import React from 'react';
import { render } from '@testing-library/react';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalsList } from '../GoalsList/PdsGoalsList';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';

describe('PdsGoalCard', () => {
  it('renders the calculated PDS goal amount', async () => {
    // Hand-derivation of $8,073.02 from the pinned defaults in
    // PdsGoalCalculatorTestWrapper (payRate=50000 salaried full-time, benefits=1500,
    // no geographic multiplier, all reimbursable fields=0, 403b=0):
    //   monthlyBase     = 50000 / 12      = 4166.67
    //   grossMonthlyPay = monthlyBase * 1 = 4166.67  (geo multiplier 0)
    //   employerFica    = 4166.67 * 0.08  =  333.33
    //   salarySubtotal  = 4500
    //   reimbursable    = max(300, 0)     =  300     (REIMBURSABLE_FLOOR)
    //   subtotal        = 4500 + 300 + 0 (403b) + 0 (workComp) + 1500 (benefits) = 6300
    //   attrition       = 6300 * 0.06     =  378
    //   creditCardFees  = 6678 / 0.94 - 6678         ≈  426.26
    //   adminBase       = 6300 + 378 + 426.26        ≈ 7104.26
    //   assessment      = 7104.26 / 0.88 - 7104.26   ≈  968.76
    //   overallTotal    = 6300 + 378 + 426.26 + 968.76 ≈ 8073.02
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('$8,073.02')).toBeInTheDocument();
  });

  it('builds the View link with the PDS goal calculator path', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ id: 'pds-goal-1', name: 'Test Goal' }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/abc123/hrTools/pdsGoalCalculator/pds-goal-1',
    );
  });

  it.each([
    {
      description: 'a Default badge when formType is Detailed',
      name: 'Detailed Goal',
      formType: DesignationSupportFormType.Detailed,
      expectedBadge: 'Default',
    },
    {
      description: 'a Simple badge when formType is Simple',
      name: 'Simple Goal',
      formType: DesignationSupportFormType.Simple,
      expectedBadge: 'Simple',
    },
  ])('renders $description', async ({ name, formType, expectedBadge }) => {
    const { findByText, queryByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name, formType }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText(name);
    expect(queryByText(expectedBadge)).toBeInTheDocument();
  });

  // The test setup pins the current date to 2020
  describe('calculations year chip', () => {
    it('shows the year when the goal is from a past year', async () => {
      const { findByText } = render(
        <PdsGoalCalculatorTestWrapper
          withProvider={false}
          calculationsMock={{
            nodes: [{ name: 'Old Goal', calculationsYear: 2019 }],
          }}
        >
          <PdsGoalsList />
        </PdsGoalCalculatorTestWrapper>,
      );

      expect(await findByText('2019')).toBeInTheDocument();
    });

    it('hides the year when the goal is from the current year', async () => {
      const { findByText, queryByText } = render(
        <PdsGoalCalculatorTestWrapper
          withProvider={false}
          calculationsMock={{
            nodes: [{ name: 'New Goal', calculationsYear: 2020 }],
          }}
        >
          <PdsGoalsList />
        </PdsGoalCalculatorTestWrapper>,
      );

      await findByText('New Goal');
      expect(queryByText('2020')).not.toBeInTheDocument();
    });
  });
});
