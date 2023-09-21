import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface GetOrganizationInvitesResponse {
  data: OrganizationInvite[];
  meta: {
    filter: object;
    sort: string;
    pagination: {
      page: number;
      per_page: number;
      total_count: number;
      total_pages: number;
    };
  };
}

export interface OrganizationInvite {
  id: string;
  type: string;
  attributes: {
    accepted_at: string | null;
    created_at: string;
    code: string;
    invite_user_as: string;
    recipient_email: string;
    updated_at: string;
    updated_in_db_at: string;
  };
}

export interface OrganizationInviteCamelCase {
  id: string;
  acceptedAt: string | null;
  createdAt: string;
  code: string;
  inviteUserAs: string;
  recipientEmail: string;
}

// As this request returns the data with a relationships object, we have to manually link the relationships to each contact
// We first loop through each contact with a map line 143 ish.
// Then for each realtionship we loop through to find the data and add it to a object called Attributes
// We then enter a recursion, where we call the fetchAllData again if we see a relationship object on the object we're investigating.
// Sometimes this goes down into 4 objects deep before returning.
// We save the Values data onto the attributes object before returning it
// At the end we have mapped all the relationships abd gathered all the data.
// Ask Daniel Bisgrove questions if needed.
export const fetchAllData = (object, includedData) => {
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
      const foundRelationship = includedData.find((item) => item.id === id);
      if (foundRelationship) {
        if (foundRelationship.relationships) {
          return fetchAllData(foundRelationship, includedData);
        } else {
          if (foundRelationship?.attributes) {
            const foundRelationshipAttributes = {
              id: foundRelationship.id,
            };
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
    // Add id onto attributes
    if (object.id) {
      attributes['id'] = object.id;
    }
  }
  return attributes;
};
