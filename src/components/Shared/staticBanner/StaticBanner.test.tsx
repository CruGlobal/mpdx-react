import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUsersOrganizationsQuery } from './getOrganizationType.generated';
import { StaticBanner } from './StaticBanner';

const mockResponseNonCru = {
  GetUsersOrganizations: {
    userOrganizationAccounts: [
      {
        __typename: 'OrganizationAccount',
        organization: {
          __typename: 'Organization',
          organizationType: 'Non-Cru',
        },
      },
      {
        __typename: 'OrganizationAccount',
        organization: {
          __typename: 'Organization',
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
        __typename: 'OrganizationAccount',
        organization: {
          __typename: 'Organization',
          organizationType: 'Cru',
        },
      },
      {
        __typename: 'OrganizationAccount',
        organization: {
          __typename: 'Organization',
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
