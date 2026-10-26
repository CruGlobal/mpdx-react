import { ApolloCache } from '@apollo/client';
import { TFunction } from 'react-i18next';
import { Address, AddressCreator } from 'src/graphql/types.generated';
import { manualSourceValue, sourceToStr } from 'src/lib/sourceHelper';

export type AddressParts = Pick<
  Address,
  'street' | 'city' | 'state' | 'postalCode'
>;

export interface AddressAuthor {
  source: string;
  createdByUser?: Pick<AddressCreator, 'id' | 'firstName' | 'lastName'> | null;
}

export const formatAddress = ({
  street,
  city,
  state,
  postalCode,
}: AddressParts): string =>
  [
    street?.replace(/\n/g, ', '),
    city,
    [state, postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

// Other names the API uses for Siebel, the US donation system: Address#merge writes 'US' for a merged address with a
// remote id, and the NetSuite import writes 'US Donation System'. Change history shows them as one source, but other
// tools keep them apart, because their source pickers act on each raw value.
const siebelAliases = ['US', 'US Donation System'];

const changeSourceToStr = (t: TFunction, source: string): string =>
  sourceToStr(t, siebelAliases.includes(source) ? 'Siebel' : source);

export const isAutomaticChange = (source: string): boolean =>
  source !== manualSourceValue;

export const formatChangeMadeBy = (
  { source, createdByUser }: AddressAuthor,
  currentUserId: string | undefined,
  t: TFunction,
): string => {
  if (isAutomaticChange(source)) {
    return t('Automatic update from {{source}}', {
      source: changeSourceToStr(t, source),
    });
  }
  const appName = sourceToStr(t, source);
  if (createdByUser && createdByUser.id === currentUserId) {
    return t('You, in {{appName}}', { appName });
  }
  const name = [createdByUser?.firstName, createdByUser?.lastName]
    .filter(Boolean)
    .join(' ');
  return name
    ? t('{{name}}, in {{appName}}', { name, appName })
    : t('In {{appName}}', { appName });
};

// The change history comes from every contact's primary changes, so drop it when one changes and Apollo refetches it
export const evictAddressChangeHistory = (
  cache: ApolloCache<unknown>,
): void => {
  cache.evict({ fieldName: 'addressChangeHistory' });
  cache.gc();
};
