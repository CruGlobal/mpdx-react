import { renderHook } from '@testing-library/react-hooks';
import { CurrencyTable } from './FourteenMonthReport';
import { Contact } from './Layout/Table/TableHead/TableHead';
import { buildContact, monthly } from './monthlyEquivalents.mock';
import { useCsvData } from './useCsvData';

const buildTable = (
  currency: string,
  orderedContacts: Contact[],
): CurrencyTable => ({ currency, orderedContacts, totals: [] });

describe('useCsvData Solid Monthly Support', () => {
  it('puts Solid Monthly Support for each currency at the top of the export', () => {
    // Partner currency tables hold gifts in the table's own currency
    const tables = [
      buildTable('USD', [buildContact({ gifts: [0, ...monthly(100, 12)] })]),
      buildTable('CAD', [
        buildContact({
          pledgeAmount: 80,
          pledgeCurrency: 'CAD',
          giftCurrency: 'CAD',
          gifts: [0, ...monthly(80, 12)],
        }),
      ]),
    ];
    const { result } = renderHook(() => useCsvData(tables), {});

    expect(result.current[0]).toEqual(['Solid Monthly Support', 100, 'USD']);
    expect(result.current[1]).toEqual(['Solid Monthly Support', 80, 'CAD']);
    expect(result.current[2]).toEqual(['Currency', 'USD', '$']);
  });

  it('names the partners Solid Monthly Support could not convert', () => {
    // Contact names are usually "Last, First"
    const contacts = ['Rivera, Ana', 'Lee, Sam'].map((name) =>
      buildContact({
        name,
        pledgeCurrency: 'EUR',
        gifts: [0, ...monthly(100, 12)],
      }),
    );
    const { result } = renderHook(
      () => useCsvData([buildTable('USD', contacts)]),
      {},
    );

    expect(result.current[0]).toEqual([
      'Solid Monthly Support',
      0,
      'USD',
      'Not counted, no exchange rate for their commitment currency: Rivera, Ana; Lee, Sam',
    ]);
  });

  it('names partner currency partners whose commitment is in another currency', () => {
    // No gift on the CAD table is in USD, so there is no rate for the USD commitment
    const contact = buildContact({
      name: 'Rivera, Ana',
      pledgeCurrency: 'USD',
      giftCurrency: 'CAD',
      gifts: [0, ...monthly(130, 12)],
    });
    const { result } = renderHook(
      () => useCsvData([buildTable('CAD', [contact])]),
      {},
    );

    expect(result.current[0]).toEqual([
      'Solid Monthly Support',
      0,
      'CAD',
      'Not counted, no exchange rate for their commitment currency: Rivera, Ana',
    ]);
  });
});
