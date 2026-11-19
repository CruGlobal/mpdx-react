import { StatusEnum } from 'src/graphql/types.generated';
import { calculateSolidMonthlySupport } from './monthlyEquivalents';
import { buildContact, monthly } from './monthlyEquivalents.mock';

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

    expect(calculateSolidMonthlySupport(contacts, 'USD')).toEqual({
      amount: 200,
      unconvertedPartners: [],
    });
  });

  it('is 0 with no contacts', () => {
    expect(calculateSolidMonthlySupport([], 'USD')).toEqual({
      amount: 0,
      unconvertedPartners: [],
    });
  });

  // MPDX-10193 review #9: a commitment currency none of the partner's gifts were in
  it("converts a commitment at the rate other partners' gifts in that currency got", () => {
    const contacts = [
      buildContact({
        name: 'Gives USD',
        pledgeCurrency: 'CAD',
        gifts: [0, ...monthly(100, 12)],
      }),
      buildContact({
        name: 'Gives CAD',
        pledgeCurrency: 'CAD',
        giftCurrency: 'CAD',
        rate: 0.75,
        gifts: [0, ...monthly(100, 12)],
      }),
    ];

    // Both commit CAD $100 a month, which is USD $75
    expect(calculateSolidMonthlySupport(contacts, 'USD')).toEqual({
      amount: 150,
      unconvertedPartners: [],
    });
  });

  it('names the partners whose commitment currency has no rate on the report', () => {
    const contacts = [
      buildContact({
        name: 'Gives USD',
        pledgeCurrency: 'CAD',
        gifts: [0, ...monthly(100, 12)],
      }),
      buildContact({ name: 'Steady', gifts: [0, ...monthly(100, 12)] }),
    ];

    expect(calculateSolidMonthlySupport(contacts, 'USD')).toEqual({
      amount: 100,
      unconvertedPartners: ['Gives USD'],
    });
  });

  it('does not name a partner left out for missed months', () => {
    const contacts = [
      buildContact({
        pledgeCurrency: 'CAD',
        gifts: [0, ...monthly(100, 9), 0, 0, 0],
      }),
    ];

    expect(calculateSolidMonthlySupport(contacts, 'USD')).toEqual({
      amount: 0,
      unconvertedPartners: [],
    });
  });
});
