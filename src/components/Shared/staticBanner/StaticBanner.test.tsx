import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUsersOrganizationsQuery } from './getOrganizationType.generated';
import { StaticBanner } from './StaticBanner';

const mockResponseNonCru = {
  GetUsersOrganizations: {
    userOrganizationAccounts: [
      {
        organization: {
          organizationType: 'Non-Cru',
        },
      },
      {
        organization: {
          organizationType: 'Non-Cru',
        },
      },
    ],
  },
};
const mockResponseCru = {
  GetUsersOrganizations: {
    userOrganizationAccounts: [
      {
        organization: {
          organizationType: 'Cru',
        },
      },
      {
        organization: {
          organizationType: 'Non-Cru',
        },
      },
    ],
  },
};

test('static banner displays for user in Non-Cru org', async () => {
  const { queryByTestId } = render(
    <GqlMockedProvider<{
      GetUsersOrganizations: GetUsersOrganizationsQuery;
    }>
      mocks={{
        mockResponseNonCru,
      }}
    >
      <StaticBanner />
    </GqlMockedProvider>,
  );

  await waitFor(() =>
    expect(queryByTestId('nonCruOrgReminder')).toBeInTheDocument(),
  );
});

test('static banner does not display for user in a Cru org', async () => {
  const { queryByTestId } = render(
    <GqlMockedProvider<{
      GetUsersOrganizations: GetUsersOrganizationsQuery;
    }>
      mocks={{
        mockResponseCru,
      }}
    >
      <StaticBanner />
    </GqlMockedProvider>,
  );

  await waitFor(() =>
    expect(queryByTestId('nonCruOrgReminder')).not.toBeInTheDocument(),
  );
});
