import { IdValue } from 'src/graphql/types.generated';

export const getValueFromIdValue = (idValue: IdValue) => {
  return idValue.value ?? '';
};
