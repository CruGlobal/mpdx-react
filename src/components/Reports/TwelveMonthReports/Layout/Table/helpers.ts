import { Order } from '../../../Reports.type';
import { MonthTotal } from '../../TwelveMonthReport';
import { Contact, OrderBy } from './TableHead/TableHead';

// Given a contact and a sorting field, calculate a sort key for the contact that can be
// compared against other contacts' sort keys
export const extractSortKey = (
  contact: Contact,
  sortField: OrderBy,
): string => {
  const sortKey =
    typeof sortField === 'number'
      ? contact.months[sortField].total
      : contact[sortField];
  return sortKey?.toString() ?? contact.name;
};

/**
 * Sort the contacts array by the orderBy field using the direction order.
 *
 * @param contacts Contacts to sort
 * @param orderBy Field to sort by
 * @param order Sort direction
 * @returns Sorted contacts
 */
export const sortContacts = (
  contacts: Contact[],
  orderBy: OrderBy | null,
  order: Order,
): Contact[] => {
  if (!contacts || orderBy === null) {
    return contacts;
  }

  return [...contacts].sort((a, b) => {
    const compare = extractSortKey(a, orderBy)?.localeCompare(
      extractSortKey(b, orderBy),
      undefined,
      {
        numeric: true,
      },
    );

    return order === 'asc' ? compare : -compare;
  });
};

// Calculate the total amounts given by the contacts in each month
// Returns an array of the total for each month in the report
export const calculateTotals = (contacts: Contact[]): MonthTotal[] => {
  const totals: MonthTotal[] = [];
  contacts.forEach((contact) => {
    contact.months.forEach((month, idx) => {
      if (!totals[idx]) {
        totals.push({
          month: month.month,
          total: month.total,
        });
      } else {
        totals[idx].total += month.total;
      }
    });
  });
  return totals;
};
