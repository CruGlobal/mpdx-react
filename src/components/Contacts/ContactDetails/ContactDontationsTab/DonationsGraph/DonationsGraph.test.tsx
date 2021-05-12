import React from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../../__tests__/util/testingLibraryReactMock';
import { DonationsGraph } from './DonationsGraph';
import { GetDonationsGraphQuery } from './DonationsGraph.generated';

describe('Donations Graph', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <GqlMockedProvider<GetDonationsGraphQuery>>
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={['donorAccountId']}
          convertedCurrency="USD"
        />
      </GqlMockedProvider>,
    );
    expect(await findByRole('banner')).toBeVisible();
  });
});
