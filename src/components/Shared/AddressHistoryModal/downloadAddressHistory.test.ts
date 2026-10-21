import { DateTime } from 'luxon';
import i18n from 'src/lib/i18n';
import {
  HistoryAddress,
  createAddressHistoryCsv,
  downloadAddressHistory,
} from './downloadAddressHistory';

const addresses: HistoryAddress[] = [
  {
    street: '2525 Camp Creek Pkwy',
    city: 'College Park',
    state: 'GA',
    postalCode: '30337',
    source: 'MPDX',
    createdByUser: { id: 'user-1', firstName: 'Test', lastName: 'User' },
    changedAt: DateTime.local(2024, 6, 13),
  },
  {
    street: '1001 Denman St',
    city: 'Vancouver',
    state: 'BC',
    postalCode: 'V6G 2M4',
    source: 'DataServer',
    createdByUser: null,
    changedAt: DateTime.local(2018, 1, 22),
  },
];

describe('createAddressHistoryCsv', () => {
  it('builds a row per address with the date, address, the one it replaced, and who made it', () => {
    expect(
      createAddressHistoryCsv(addresses, 'user-1', i18n.t, 'en-US'),
    ).toEqual([
      ['Date', 'Address', 'Previous Address', 'Made by'],
      [
        'Jun 13, 2024',
        '2525 Camp Creek Pkwy, College Park, GA 30337',
        '1001 Denman St, Vancouver, BC V6G 2M4',
        'You, in MPDX',
      ],
      [
        'Jan 22, 2018',
        '1001 Denman St, Vancouver, BC V6G 2M4',
        '',
        'Automatic update from DonorHub',
      ],
    ]);
  });
});

describe('downloadAddressHistory', () => {
  it('downloads a CSV named after the contact', () => {
    const link = document.createElement('a');
    const setAttribute = jest.spyOn(link, 'setAttribute');
    const click = jest.spyOn(link, 'click').mockImplementation();
    jest.spyOn(document, 'createElement').mockReturnValue(link);
    const removeChild = jest.spyOn(document.body, 'removeChild');

    downloadAddressHistory(
      addresses,
      'Baggins, Frodo',
      'user-1',
      i18n.t,
      'en-US',
    );

    expect(setAttribute).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );
    expect(setAttribute).toHaveBeenCalledWith(
      'download',
      'Address History - Baggins, Frodo.csv',
    );
    expect(click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalledWith(link);
  });
});
