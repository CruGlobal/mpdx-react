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

  it('renders a Default badge when formType is Detailed', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [
            {
              name: 'Detailed Goal',
              formType: DesignationSupportFormType.Detailed,
            },
          ],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Default')).toBeInTheDocument();
  });

  it('renders a Simple badge when formType is Simple', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper
        withProvider={false}
        calculationsMock={{
          nodes: [
            {
              name: 'Simple Goal',
              formType: DesignationSupportFormType.Simple,
            },
          ],
        }}
      >
        <PdsGoalsList />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Simple')).toBeInTheDocument();
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
