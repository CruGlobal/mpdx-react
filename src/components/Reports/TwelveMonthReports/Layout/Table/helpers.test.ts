import { ErgonoMockShape } from 'graphql-ergonomock';
import { DeepPartial } from 'ts-essentials';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  TwelveMonthReportContactFragment,
  TwelveMonthReportContactFragmentDoc,
} from '../../GetTwelveMonthReport.generated';
import { calculateTotals, extractSortKey, sortContacts } from './helpers';

const mockContact = (
  mocks: ErgonoMockShape & DeepPartial<TwelveMonthReportContactFragment>,
) =>
  gqlMock<TwelveMonthReportContactFragment>(
    TwelveMonthReportContactFragmentDoc,
    {
      mocks,
    },
  );

describe('extractSortKey', () => {
  it('extracts string values from the contact', () => {
    const contact = mockContact({
      name: 'John Doe',
    });

    expect(extractSortKey(contact, 'name')).toBe('John Doe');
  });

  it('converts number values to strings', () => {
    const contact = mockContact({
      total: 1000,
    });

    expect(extractSortKey(contact, 'total')).toBe('1000');
  });

  it('extracts month totals from the contact', () => {
    const contact = mockContact({
      months: [{}, { total: 100 }],
    });

    expect(extractSortKey(contact, 1)).toBe('100');
  });

  it('defaults to the contact name', () => {
    const contact = mockContact({
      name: 'Contact',
      status: null,
    });

    expect(extractSortKey(contact, 'status')).toBe('Contact');
  });
});

describe('sortContacts', () => {
  const contacts = [100, 200, 150, 1000].map((total) => mockContact({ total }));

  it('sorts contacts ascending', () => {
    expect(
      sortContacts(contacts, 'total', 'asc').map((contact) => contact.total),
    ).toEqual([100, 150, 200, 1000]);
  });

  it('sorts contacts descending', () => {
    expect(
      sortContacts(contacts, 'total', 'desc').map((contact) => contact.total),
    ).toEqual([1000, 200, 150, 100]);
  });

  it('ignores null order by', () => {
    expect(
      sortContacts(contacts, null, 'asc').map((contact) => contact.total),
    ).toEqual([100, 200, 150, 1000]);
  });
});

describe('calculateTotals', () => {
  const makeContact = (month1: number, month2: number, month3: number) =>
    mockContact({
      months: [
        { month: 'Jan', total: month1 },
        { month: 'Feb', total: month2 },
        { month: 'Mar', total: month3 },
      ],
    });

  it('sums totals for each month across contacts', () => {
    expect(
      calculateTotals([
        makeContact(100, 200, 150),
        makeContact(70, 90, 40),
        makeContact(400, 250, 125),
      ]),
    ).toEqual([
      { month: 'Jan', total: 570 },
      { month: 'Feb', total: 540 },
      { month: 'Mar', total: 315 },
    ]);
  });
});
