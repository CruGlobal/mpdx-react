import { PersonUpdateInput } from 'src/graphql/types.generated';
import { PhoneNumberData } from './Contact';

export const determineBulkDataToSend = (
  dataState: {
    [key: string]: PhoneNumberData;
  },
  defaultSource: string,
  appName: string,
): PersonUpdateInput[] => {
  const dataToSend = [] as PersonUpdateInput[];

  Object.entries(dataState).forEach((value) => {
    const primaryNumber = value[1].phoneNumbers.find(
      (number) =>
        number.source === defaultSource ||
        (defaultSource === appName && number.source === 'MPDX'),
    );
    if (primaryNumber) {
      dataToSend.push({
        id: value[0],
        phoneNumbers: value[1].phoneNumbers.map((phoneNumber) => ({
          number: phoneNumber.number,
          id: phoneNumber.id,
          primary: phoneNumber.id === primaryNumber.id,
          validValues: true,
        })),
      });
    }
  });

  return dataToSend;
};
