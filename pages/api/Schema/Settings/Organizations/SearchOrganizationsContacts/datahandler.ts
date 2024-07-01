import { fetchAllData } from 'src/lib/deserializeJsonApi';

export interface SearchOrganizationsContactsResponse {
  data: Contacts[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      total_count: number;
      total_pages: number;
    };
  };
  included: [ContactIncludedTypes];
}
type Contacts = {
  id: string;
  attributes: ContactAttributes;
  relationships: {
    account_list: {
      data: ContactRelationshipTypes;
    };
    addresses: {
      data: ContactRelationshipTypes[];
    };
    people: {
      data: ContactRelationshipTypes[];
    };
  };
};

type ContactAttributes = {
  allow_deletion: boolean;
  name: string;
  square_avatar: string;
};

type ContactRelationshipTypes = {
  id: string;
  type: string;
};

type ContactIncludedTypes = {
  id: string;
  type: string;
  attributes: any;
  relationships: any;
};

interface SearchOrganizationsContactsReturned {
  contacts: SearchOrganizationsContactsContact[];
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
  historic: boolean;
};

type SearchOrganizationsContactsContact = {
  id: string;
  allowDeletion: boolean;
  name: string;
  squareAvatar: string;
  people: {
    firstName: string;
    lastName: string;
    emailAddresses: EmailAddress[];
    phoneNumbers: {
      number: string;
      primary: boolean;
      historic: boolean;
    }[];
    deceased: boolean;
  }[];
  accountList: {
    name: string;
    accountListUsers: {
      id: string;
      firstName: string;
      lastName: string;
      emailAddresses: EmailAddress[];
    }[];
  };
  addresses: {
    primaryMailingAddress: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  }[];
};

export const SearchOrganizationsContacts = (
  data: SearchOrganizationsContactsResponse,
): SearchOrganizationsContactsReturned => {
  const contacts = data.data.map((contact) => {
    const attributes = fetchAllData(contact, data.included) as Omit<
      SearchOrganizationsContactsContact,
      'id'
    >;
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
    contacts: contacts as SearchOrganizationsContactsContact[],
    pagination: {
      page: page,
      perPage: per_page,
      totalCount: total_count,
      totalPages: total_pages,
    },
  };
};
