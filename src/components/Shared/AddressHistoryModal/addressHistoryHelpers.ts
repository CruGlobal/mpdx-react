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

export const isAutomaticChange = (source: string): boolean =>
  source !== manualSourceValue;

export const formatChangeMadeBy = (
  { source, createdByUser }: AddressAuthor,
  currentUserId: string | undefined,
  t: TFunction,
): string => {
  if (isAutomaticChange(source)) {
    return t('Automatic update from {{source}}', {
      source: sourceToStr(t, source),
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

// The change history comes from every contact's addresses, so drop it when one changes and Apollo refetches it
export const evictAddressChangeHistory = (
  cache: ApolloCache<unknown>,
): void => {
  cache.evict({ fieldName: 'addressChangeHistory' });
  cache.gc();
};
