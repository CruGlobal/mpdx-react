import i18n from 'src/lib/i18n';
import {
  currentUserId,
  mockAddressChanges,
} from '../ChangeHistoryAddressesMock';
import {
  createAddressChangesCsv,
  downloadAddressChanges,
} from './downloadAddressChanges';

const getStatusLabel = () => 'Partner - Financial';

describe('createAddressChangesCsv', () => {
  it('builds a header and a row per change', () => {
    const rows = createAddressChangesCsv(
      mockAddressChanges,
      currentUserId,
      getStatusLabel,
      i18n.t,
      'en-US',
    );

    expect(rows).toHaveLength(mockAddressChanges.length + 1);
    expect(rows[0]).toEqual([
      'Date',
      'Partner',
      'Donor Account Numbers',
      'Status',
      'Address',
      'Previous Address',
      'Made by',
    ]);
    expect(rows[1]).toEqual([
      'Sep 30, 2026',
      'Dalmation, Pongo and Perdita',
      '10001',
      'Partner - Financial',
      '2125 6th Ave W, Seattle, WA 98119',
      '98 Lake St, Seattle, WA 98109',
      'Automatic update from US Donation Services',
    ]);
  });

  it('leaves the previous address blank when there is none', () => {
    const rows = createAddressChangesCsv(
      mockAddressChanges,
      currentUserId,
      getStatusLabel,
      i18n.t,
      'en-US',
    );

    expect(rows[6][1]).toBe('Doe, John and Jane');
    expect(rows[6][5]).toBe('');
  });
});

describe('downloadAddressChanges', () => {
  it('downloads the address change history CSV', () => {
    const link = document.createElement('a');
    const setAttribute = jest.spyOn(link, 'setAttribute');
    const click = jest.spyOn(link, 'click').mockImplementation();
    jest.spyOn(document, 'createElement').mockReturnValue(link);

    downloadAddressChanges(
      mockAddressChanges,
      currentUserId,
      getStatusLabel,
      i18n.t,
      'en-US',
    );

    expect(setAttribute).toHaveBeenCalledWith(
      'download',
      'Address Change History.csv',
    );
    expect(click).toHaveBeenCalled();
  });
});
