import { OrganizationsAccountList } from 'src/graphql/types.generated';

export class AccountListsMocks {
  accountList: OrganizationsAccountList = {
    id: '1111',
    name: 'Name1',
    designationAccounts: [
      {
        id: '297b398f',
        displayName: 'DisplayName (4791.0)',
        organization: {
          id: '639979e2',
          name: 'Agape Bulgaria',
        },
      },
    ],
    accountListUsersInvites: [
      {
        id: '3104a0fb',
        inviteUserAs: 'user',
        recipientEmail: 'inviteUser@cru.org',
        invitedByUser: {
          id: '4c028cb0',
          firstName: 'firstName',
          lastName: 'lastName',
        },
      },
    ],
    accountListUsers: [
      {
        __typename: 'AccountListUsers',
        id: 'e8a19920',
        userFirstName: 'userFirstName',
        userLastName: 'userLastName',
        allowDeletion: true,
        userEmailAddresses: [
          {
            id: '507548d6',
            email: 'userEmail@cru.org',
            primary: true,
          },
        ],
      },
    ],
    accountListCoaches: [
      {
        __typename: 'OrganizationAccountListCoaches',
        id: 'd10e6360',
        coachFirstName: 'coachFirstName',
        coachLastName: 'coachLastName',
        coachEmailAddresses: [
          {
            id: 'a998a6d7',
            email: 'coachFirstName.coachLastName@cru.org',
            primary: true,
          },
        ],
      },
    ],
    accountListCoachInvites: [
      {
        id: '3104a0fb',
        inviteUserAs: 'coach',
        recipientEmail: 'inviteCoach@cru.org',
        invitedByUser: {
          id: '4c028cb0',
          firstName: 'inviteCoachFirstName',
          lastName: 'inviteCoachLastName',
        },
      },
    ],
  };
}
