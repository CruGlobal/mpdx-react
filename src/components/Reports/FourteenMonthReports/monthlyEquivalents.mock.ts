import { DateTime } from 'luxon';
import { StatusEnum } from 'src/graphql/types.generated';
import { Contact } from './Layout/Table/TableHead/TableHead';

interface BuildContactOptions {
  name?: string;
  pledgeAmount?: number | null;
  pledgeFrequency?: string | null;
  status?: string;
  pledgeCurrency?: string;
  giftCurrency?: string;
  // Rate the gifts were converted to the report currency at
  rate?: number;
  // Gifts per month in the gift currency, newest first, starting with the current month.
  // A number is one gift of that amount (0 for none); an array is several gifts.
  gifts: Array<number | number[]>;
}

export const buildContact = ({
  name = 'Test Contact',
  pledgeAmount = 100,
  pledgeFrequency = '1.0',
  status = StatusEnum.PartnerFinancial,
  pledgeCurrency = 'USD',
  giftCurrency = 'USD',
  rate = 1,
  gifts,
}: BuildContactOptions): Contact => {
  const monthGifts = [...gifts, ...Array(14).fill(0)]
    .slice(0, 14)
    .map((gift) => (Array.isArray(gift) ? gift : gift > 0 ? [gift] : []));
  const totals = monthGifts.map((amounts) =>
    amounts.reduce((sum, amount) => sum + amount, 0),
  );
  return {
    id: name,
    name,
    total: totals.reduce((sum, total) => sum + total, 0),
    average: 0,
    minimum: 0,
    completeMonthsTotal: 0,
    accountNumbers: [],
    lateBy30Days: false,
    lateBy60Days: false,
    pledgeAmount,
    pledgeCurrency,
    pledgeFrequency,
    status,
    months: monthGifts.map((amounts, index) => {
      const month = DateTime.fromISO('2020-12-01')
        .minus({ months: index })
        .toISODate()!;
      return {
        month,
        total: totals[index] * rate,
        salaryCurrencyTotal: totals[index] * rate,
        donations: amounts.map((amount) => ({
          amount,
          date: month,
          paymentMethod: null,
          currency: giftCurrency,
        })),
      };
    }),
  };
};

export const monthly = (amount: number, count: number): number[] =>
  Array(count).fill(amount);
