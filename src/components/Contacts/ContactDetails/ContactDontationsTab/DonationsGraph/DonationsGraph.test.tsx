import React from 'react';
import { render } from '../../../../../../__tests__/util/testingLibraryReactMock';
import { contactDonationsMock } from '../ContactDonationsTab.mocks';
import { DonationsGraph } from './DonationsGraph';

describe('Donations Graph', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <DonationsGraph
        donations={contactDonationsMock}
        convertedCurrency="USD"
      />,
    );
    expect(await findByRole('banner')).toBeVisible();
  });

  it('test null renderer', async () => {
    const { findByRole } = render(
      <DonationsGraph donations={null} convertedCurrency="USD" />,
    );
    expect(await findByRole('alert')).toBeVisible();
  });
});
