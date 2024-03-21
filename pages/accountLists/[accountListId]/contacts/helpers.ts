import { DateTime } from 'luxon';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { dateFormatShort } from 'src/lib/intlFormat';
import { ContactsQuery } from './Contacts.generated';
import { Coordinates } from './map/map';

export const getRedirectPathname = ({
  routerPathname,
  accountListId,
  contactId,
  viewMode,
}: {
  routerPathname: string;
  accountListId: string;
  contactId?: string;
  viewMode?: TableViewModeEnum;
}): string => {
  let pathname = '';
  if (
    routerPathname === '/accountLists/[accountListId]/contacts/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/contacts`;

    if (viewMode === TableViewModeEnum.Flows) {
      pathname += '/flows';
    } else if (viewMode === TableViewModeEnum.Map) {
      pathname += '/map';
    }
  } else if (
    routerPathname === '/accountLists/[accountListId]/tasks/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/tasks`;
  } else if (
    routerPathname ===
    '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/reports/partnerGivingAnalysis`;
  } else if (
    routerPathname ===
    '/accountLists/[accountListId]/reports/partnerCurrency/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/reports/partnerCurrency`;
  } else if (
    routerPathname ===
    '/accountLists/[accountListId]/reports/salaryCurrency/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/reports/salaryCurrency`;
  } else if (
    routerPathname ===
    '/accountLists/[accountListId]/reports/donations/[[...contactId]]'
  ) {
    pathname = `/accountLists/${accountListId}/reports/donations`;
  }

  if (contactId) {
    pathname += `/${contactId}`;
  }

  return pathname;
};

export const coordinatesFromContacts = (
  contacts: ContactsQuery['contacts'],
  locale: string,
): Coordinates[] =>
  contacts.nodes.map((contact): Coordinates => {
    const address = contact.primaryAddress;
    if (!address?.geo) {
      return {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
      };
    }

    const coords = address.geo.split(',');
    const [lat, lng] = coords;
    return {
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      status: contact.status,
      lat: Number(lat),
      lng: Number(lng),
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postal: address.postalCode,
      source: address.source,
      date: `(${dateFormatShort(DateTime.fromISO(address.createdAt), locale)})`,
    };
  });
