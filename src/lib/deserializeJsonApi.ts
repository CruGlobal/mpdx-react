import { snakeToCamel } from 'src/lib/snakeToCamel';

// As this request returns the data with a relationships object, we have to manually link the relationships to each contact
// We first loop through each contact with a map line 143 ish.
// Then for each relationship we loop through to find the data and add it to a object called Attributes
// We then enter a recursion, where we call the fetchAllData again if we see a relationship object on the object we're investigating.
// Sometimes this goes down into 4 objects deep before returning.
// We save the Values data onto the attributes object before returning it
// At the end we have mapped all the relationships and gathered all the data.
// Ask Daniel Bisgrove questions if needed.
export const fetchAllData = (object, includedData) => {
  const attributes = {};
  Object.keys(object.attributes).map((key) => {
    attributes[snakeToCamel(key)] = object.attributes[key];
  });

  Object.keys(object.relationships).forEach((relationship) => {
    const relationshipData = object.relationships[relationship].data;
    // check if array
    const isArray = Array.isArray(relationshipData);
    const ids = isArray
      ? relationshipData.map((item) => item.id)
      : [relationshipData?.id];

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
  });
  return attributes;
};
