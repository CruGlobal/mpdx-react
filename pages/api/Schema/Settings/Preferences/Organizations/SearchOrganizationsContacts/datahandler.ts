import { snakeToCamel } from 'src/lib/snakeToCamel';

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

type emailAddress = {
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
    emailAddresses: emailAddress[];
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
      emailAddresses: emailAddress[];
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

export const SearchOrganizationsContacts = async (
  data: SearchOrganizationsContactsResponse,
): Promise<SearchOrganizationsContactsReturned> => {
  // As this request returns the data with a relationships object, we have to manually link the relationships to each contact
  // We first loop through each contact with a map line 143 ish.
  // Then for each realtionship we loop through to find the data and add it to a object called Attributes
  // We then enter a recursion, where we call the fetchAllData again if we see a relationship object on the object we're investigating.
  // Sometimes this goes down into 4 objects deep before returning.
  // We save the Values data onto the attributes object before returning it
  // At the end we have mapped all the relationships abd gathered all the data.
  // Ask Daniel Bisgrove questions if needed.
  const fetchAllData = (object) => {
    const attributes = {};
    Object.keys(object.attributes).map((key) => {
      attributes[snakeToCamel(key)] = object.attributes[key];
    });

    for (const relationship in object.relationships) {
      const relationshipData = object.relationships[relationship].data;
      // check if array
      const isArray = Array.isArray(relationshipData);
      const ids = isArray
        ? relationshipData.map((item) => item.id)
        : [relationshipData.id];

      const values = ids.map((id) => {
        const foundRelationship = data.included.find((item) => item.id === id);
        if (foundRelationship) {
          if (foundRelationship.relationships) {
            return fetchAllData(foundRelationship);
          } else {
            if (foundRelationship?.attributes) {
              const foundRelationshipAttributes = {};
              Object.keys(foundRelationship.attributes).map((key) => {
                foundRelationshipAttributes[snakeToCamel(key)] =
                  foundRelationship.attributes[key];
              });
              return foundRelationshipAttributes;
            } else {
              return foundRelationship.id;
            }
          }
        }
      });
      // If relationship started as a object, we should return the data as an object.
      // Otherwise return it as an array.
      attributes[snakeToCamel(relationship)] =
        !isArray && values?.length === 1 ? { ...values[0] } : values;
    }
    return attributes;
  };

  const contacts = (await data.data.map(async (contact) => {
    const attributes = fetchAllData(contact) as Omit<
      SearchOrganizationsContactsContact,
      'id'
    >;
    return {
      id: contact.id,
      ...attributes,
    };
  })) as unknown;

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
