import { PersonUpdateInput } from 'src/graphql/types.generated';
import { sourcesMatch } from 'src/utils/sourceHelper';
import { PhoneNumberData } from './Contact';

export const determineBulkDataToSend = (
  dataState: {
    [key: string]: PhoneNumberData;
  },
  defaultSource: string,
): PersonUpdateInput[] => {
  const dataToSend = [] as PersonUpdateInput[];

  Object.entries(dataState).forEach(([id, data]) => {
    const primaryNumber = data.phoneNumbers.find((number) =>
      sourcesMatch(defaultSource, number.source),
    );
    if (primaryNumber) {
      dataToSend.push({
        id,
        phoneNumbers: data.phoneNumbers.map((phoneNumber) => ({
          id: phoneNumber.id,
          primary: phoneNumber.id === primaryNumber.id,
          number: phoneNumber.number,
          validValues: true,
        })),
      });
    }
  });

  return dataToSend;
};
