import { fetchAllData } from 'src/lib/deserializeJsonApi';

export interface SearchOrganizationsAccountListsResponse {
  data: AccountLists[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      total_count: number;
      total_pages: number;
    };
  };
  included: [AccountListIncludedTypes];
}
type AccountLists = {
  id: string;
  attributes: AccountListAttributes;
  relationships: {
    account_list_coaches: {
      data: AccountListRelationshipTypes[];
    };
    account_list_invites: {
      data: AccountListRelationshipTypes[];
    };
    account_list_users: {
      data: AccountListRelationshipTypes[];
    };
    designation_accounts: {
      data: AccountListRelationshipTypes[];
    };
  };
};

type AccountListAttributes = {
  name: string;
};

type AccountListRelationshipTypes = {
  id: string;
  type: string;
};

type AccountListIncludedTypes = {
  id: string;
  type: string;
  attributes: any;
  relationships: any;
};

interface SearchOrganizationsAccountListsReturned {
  accountLists: SearchOrganizationsAccountListsAccountList[];
  pagination: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
}

type EmailAddress = {
  email: string;
  primary: boolean;
  id: string;
};
type AccountListInvite = {
  id: string;
  inviteUserAs: string;
  recipientEmail: string;
  invitedByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

type SearchOrganizationsAccountListsAccountList = {
  name: string;
  id: string;
  organizationCount: number;
  designationAccounts: {
    displayName: string;
    id: string;
    organization: {
      id: string;
      name: string;
    };
  }[];
  accountListUsers: {
    id: string;
    userFirstName: string;
    userLastName: string;
    allowDeletion: boolean;
    userId: string;
    lastSyncedAt: string;
    organizationCount: number;
    userEmailAddresses: EmailAddress[];
  }[];
  accountListUsersInvites: AccountListInvite[];
  accountListCoaches: {
    id: string;
    coachFirstName: string;
    coachLastName: string;
    coachEmailAddresses: EmailAddress[];
  }[];
  accountListCoachInvites: AccountListInvite[];
};

export const SearchOrganizationsAccountLists = (
  data: SearchOrganizationsAccountListsResponse,
): SearchOrganizationsAccountListsReturned => {
  const accountLists = data.data.map((contact) => {
    const attributes = fetchAllData(contact, data.included) as Omit<
      SearchOrganizationsAccountListsAccountList,
      'id'
    > & {
      accountListInvites?: AccountListInvite[];
    };

    // Added functionality to separate invites by user or coach
    if (attributes.accountListInvites) {
      attributes.accountListInvites.forEach((invite) => {
        const userInvites = attributes.accountListUsersInvites || [];
        const coachInvites = attributes.accountListCoachInvites || [];
        if (invite.inviteUserAs === 'user') {
          attributes.accountListUsersInvites = userInvites.concat([invite]);
        }
        if (invite.inviteUserAs === 'coach') {
          attributes.accountListCoachInvites = coachInvites.concat([invite]);
        }
      });
    }
    delete attributes.accountListInvites;

    return {
      id: contact.id,
      ...attributes,
    };
  }) as unknown;

  const {
    page = 0,
    per_page = 0,
    total_count = 0,
    total_pages = 0,
  } = data.meta.pagination;

  return {
    accountLists: accountLists as SearchOrganizationsAccountListsAccountList[],
    pagination: {
      page: page,
      perPage: per_page,
      totalCount: total_count,
      totalPages: total_pages,
    },
  };
};
