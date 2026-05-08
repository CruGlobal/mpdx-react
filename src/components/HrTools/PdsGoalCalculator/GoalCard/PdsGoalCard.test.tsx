import React from 'react';
import { render } from '@testing-library/react';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalsList } from '../GoalsList/PdsGoalsList';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';

describe('PdsGoalCard', () => {
  it('renders the calculated PDS goal amount', async () => {
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

    expect(await findByText('$849.44')).toBeInTheDocument();
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

  it('renders no form-type badge when formType is null (legacy goal)', async () => {
    const { findByText, queryByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [{ name: 'Legacy Goal', formType: null }],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByText('Legacy Goal');
    expect(queryByText('Default')).not.toBeInTheDocument();
    expect(queryByText('Simple')).not.toBeInTheDocument();
  });
});
