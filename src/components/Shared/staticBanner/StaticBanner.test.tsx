import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUsersOrganizationsQuery } from './getOrganizationType.generated';
import { StaticBanner } from './StaticBanner';

const mockResponse = {
  userOrganizationAccounts: [
    {
      __typename: 'OrganizationAccount',
      organization: {
        __typename: 'Organization',
        apiClass: 'OfflineOrg',
        id: '0673b517-4f4d-4c47-965e-0757a198a8a4',
        name: 'Cru - New Staff',
        oauth: false,
        organizationType: 'Non-Cru',
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-10-25T06:14:34-07:00',
      username: null,
    },
    {
      __typename: 'OrganizationAccount',
      organization: {
        __typename: 'Organization',
        apiClass: 'OfflineOrg',
        id: '1a122b65-d98f-45c7-a2ab-c3c62da63405',
        name: 'Campus Crusade for Christ - Egypt',
        oauth: false,
        organizationType: 'Non-Cru',
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-10-25T06:14:34-07:00',
      username: null,
    },
    {
      __typename: 'OrganizationAccount',
      organization: {
        __typename: 'Organization',
        apiClass: 'Siebel',
        id: '7ab3ec4b-7108-40bf-a998-ce813d10c821',
        name: 'Cru - United States of America',
        oauth: false,
        organizationType: 'Non-Cru',
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-10-25T06:14:35-07:00',
      username: null,
    },
    {
      __typename: 'OrganizationAccount',
      organization: {
        __typename: 'Organization',
        apiClass: 'OfflineOrg',
        id: 'b213e64b-7e76-4ef1-b756-075ec52b61d7',
        name: 'Center for Bio-Ethical Reform',
        oauth: false,
        organizationType: 'Non-Cru',
      },
      latestDonationDate: null,
      lastDownloadedAt: '2023-10-25T06:14:34-07:00',
      username: null,
    },
  ],
};

test('static banner displays', () => {
  const { queryByTestId } = render(
    <GqlMockedProvider<{ userOrganizationAccounts: GetUsersOrganizationsQuery }>
      mocks={{
        mockResponse,
      }}
    >
      <StaticBanner />
    </GqlMockedProvider>,
  );

  expect(queryByTestId('nonCruOrgReminder')).toBeInTheDocument();
});
