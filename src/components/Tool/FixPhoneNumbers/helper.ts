import { PersonUpdateInput } from 'src/graphql/types.generated';
import { FormValuesPerson } from './FixPhoneNumbers';

export const determineBulkDataToSend = (
  values: FormValuesPerson[],
  defaultSource: string,
): PersonUpdateInput[] => {
  const dataToSend = [] as PersonUpdateInput[];

  values.forEach((value) => {
    const primaryNumber = value.phoneNumbers.nodes.find(
      (number) => number.source === defaultSource,
    );
    if (primaryNumber) {
      dataToSend.push({
        id: value.id,
        phoneNumbers: value.phoneNumbers.nodes.map((number) => ({
          id: number.id,
          primary: number.id === primaryNumber.id,
          number: number.number,
          validValues: true,
        })),
      });
    }
  });
  return dataToSend;
};
