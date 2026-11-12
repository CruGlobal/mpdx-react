import { DateTime } from 'luxon';
import { StatusEnum } from 'src/graphql/types.generated';
import { Contact } from './Layout/Table/TableHead/TableHead';
import {
  calculateSolidMonthlySupport,
  getSolidMonthlySupport,
} from './monthlyEquivalents';

interface BuildContactOptions {
  pledgeAmount?: number | null;
  pledgeFrequency?: string | null;
  status?: string;
  // Month totals, newest first, starting with the current month
  gifts: number[];
}

const buildContact = ({
  pledgeAmount = 100,
  pledgeFrequency = '1.0',
  status = StatusEnum.PartnerFinancial,
  gifts,
}: BuildContactOptions): Contact => {
  const totals = [...gifts, ...Array(14).fill(0)].slice(0, 14);
  return {
    id: 'contact-1',
    name: 'Test Contact',
    total: totals.reduce((sum, total) => sum + total, 0),
    average: 0,
    minimum: 0,
    completeMonthsTotal: 0,
    accountNumbers: [],
    lateBy30Days: false,
    lateBy60Days: false,
    pledgeAmount,
    pledgeCurrency: 'USD',
    pledgeFrequency,
    status,
    months: totals.map((total, index) => ({
      month: DateTime.fromISO('2020-12-01')
        .minus({ months: index })
        .toISODate()!,
      total,
      salaryCurrencyTotal: total,
      donations: [],
    })),
  };
};

const monthly = (amount: number, count: number): number[] =>
  Array(count).fill(amount);

describe('getSolidMonthlySupport', () => {
  it('counts a monthly partner who never missed at their commitment', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 12)] });

    expect(getSolidMonthlySupport(contact)).toBe(100);
  });

  it('ignores the current month', () => {
    const contact = buildContact({ gifts: [500, ...monthly(100, 12)] });

    expect(getSolidMonthlySupport(contact)).toBe(100);
  });

  it('ignores the oldest, partial month', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 12), 900] });

    expect(getSolidMonthlySupport(contact)).toBe(100);
  });

  it('leaves gifts above the commitment out', () => {
    const contact = buildContact({
      gifts: [0, 400, ...monthly(100, 11)],
    });

    expect(getSolidMonthlySupport(contact)).toBe(100);
  });

  it('averages in a partner who gave less than their commitment', () => {
    const contact = buildContact({ gifts: [0, ...monthly(50, 12)] });

    expect(getSolidMonthlySupport(contact)).toBe(50);
  });

  it('still counts a monthly partner who missed exactly 2 months, at their average', () => {
    const contact = buildContact({
      gifts: [0, ...monthly(100, 5), 0, ...monthly(100, 5), 0],
    });

    // $1,000 over 12 months
    expect(getSolidMonthlySupport(contact)).toBe(83);
  });

  it('leaves out a monthly partner who missed more than 2 months', () => {
    const contact = buildContact({
      gifts: [0, ...monthly(100, 9), 0, 0, 0],
    });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });

  it('leaves out a monthly partner who started giving 5 months ago', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 5)] });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });

  it('leaves out a weekly partner who missed more than 2 months', () => {
    const contact = buildContact({
      pledgeAmount: 25,
      pledgeFrequency: '0.23',
      gifts: [0, 0, 0, 0, ...monthly(108, 9)],
    });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });

  it('counts a weekly partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 25,
      pledgeFrequency: '0.23',
      gifts: [0, ...monthly(125, 12)],
    });

    // $25 / 0.23 months, rounded
    expect(getSolidMonthlySupport(contact)).toBe(109);
  });

  it('counts a quarterly partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 450,
      pledgeFrequency: '3.0',
      gifts: [0, 450, 0, 0, 450, 0, 0, 450, 0, 0, 450, 0, 0],
    });

    expect(getSolidMonthlySupport(contact)).toBe(150);
  });

  it('counts an annual partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 1200,
      pledgeFrequency: '12.0',
      gifts: [0, 0, 0, 0, 0, 0, 1200],
    });

    expect(getSolidMonthlySupport(contact)).toBe(100);
  });

  it('averages in a quarterly partner who missed a gift', () => {
    const contact = buildContact({
      pledgeAmount: 450,
      pledgeFrequency: '3.0',
      gifts: [0, 450, 0, 0, 0, 0, 0, 450, 0, 0, 450, 0, 0],
    });

    expect(getSolidMonthlySupport(contact)).toBe(113);
  });

  it('counts nothing for a contact who is not a financial partner', () => {
    const contact = buildContact({
      status: StatusEnum.PartnerSpecial,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });

  it('counts nothing for a financial partner with no commitment amount', () => {
    const contact = buildContact({
      pledgeAmount: null,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });

  it('counts nothing for a financial partner with no commitment frequency', () => {
    const contact = buildContact({
      pledgeFrequency: null,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact)).toBe(0);
  });
});

describe('calculateSolidMonthlySupport', () => {
  it('adds up every contact', () => {
    const contacts = [
      buildContact({ gifts: [0, ...monthly(100, 12)] }),
      buildContact({
        pledgeAmount: 1200,
        pledgeFrequency: '12.0',
        gifts: [0, 1200],
      }),
      buildContact({ gifts: [0, ...monthly(100, 9), 0, 0, 0] }),
      buildContact({
        status: StatusEnum.PartnerPray,
        gifts: [0, ...monthly(100, 12)],
      }),
    ];

    expect(calculateSolidMonthlySupport(contacts)).toBe(200);
  });

  it('is 0 with no contacts', () => {
    expect(calculateSolidMonthlySupport([])).toBe(0);
  });
});
