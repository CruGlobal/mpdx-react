import { StatusEnum } from 'src/graphql/types.generated';
import { getSolidMonthlySupport } from './monthlyEquivalents';
import { buildContact, monthly } from './monthlyEquivalentsTestContact';

describe('getSolidMonthlySupport', () => {
  it('counts a monthly partner who never missed at their commitment', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 12)] });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('ignores the current month', () => {
    const contact = buildContact({ gifts: [500, ...monthly(100, 12)] });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('ignores the oldest, partial month', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 12), 900] });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('leaves gifts above the commitment out', () => {
    const contact = buildContact({
      gifts: [0, 400, ...monthly(100, 11)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('averages in a partner who gave less than their commitment', () => {
    const contact = buildContact({ gifts: [0, ...monthly(50, 12)] });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(50);
  });

  it('still counts a monthly partner who missed exactly 2 months, at their average', () => {
    const contact = buildContact({
      gifts: [0, ...monthly(100, 5), 0, ...monthly(100, 5), 0],
    });

    // $1,000 over 12 months
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(83);
  });

  it('leaves out a monthly partner who missed more than 2 months', () => {
    const contact = buildContact({
      gifts: [0, ...monthly(100, 9), 0, 0, 0],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  // MPDX-10193 review #10: a gift that slips from the 31st to the 1st empties one month
  // and doubles up the next
  it('still counts a monthly partner whose gifts slipped across month ends', () => {
    const contact = buildContact({
      gifts: [
        0,
        100,
        [100, 100],
        0,
        100,
        [100, 100],
        0,
        100,
        [100, 100],
        0,
        100,
        100,
        100,
      ],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('lets one extra gift make up for only one empty month next to it', () => {
    const contact = buildContact({
      gifts: [0, [100, 100], 0, 0, 0, 0, ...monthly(100, 7)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('leaves out a monthly partner who started giving 5 months ago', () => {
    const contact = buildContact({ gifts: [0, ...monthly(100, 5)] });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('leaves out a weekly partner who missed more than 2 months', () => {
    const contact = buildContact({
      pledgeAmount: 25,
      pledgeFrequency: '0.23',
      gifts: [0, 0, 0, 0, ...monthly(108, 9)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('counts a weekly partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 25,
      pledgeFrequency: '0.23',
      gifts: [0, ...monthly(125, 12)],
    });

    // $25 / 0.23 months, rounded
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(109);
  });

  it('counts a quarterly partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 450,
      pledgeFrequency: '3.0',
      gifts: [0, 450, 0, 0, 450, 0, 0, 450, 0, 0, 450, 0, 0],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(150);
  });

  it('counts an annual partner at their monthly equivalent', () => {
    const contact = buildContact({
      pledgeAmount: 1200,
      pledgeFrequency: '12.0',
      gifts: [0, 0, 0, 0, 0, 0, 1200],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('averages in a quarterly partner who missed a gift', () => {
    const contact = buildContact({
      pledgeAmount: 450,
      pledgeFrequency: '3.0',
      gifts: [0, 450, 0, 0, 0, 0, 0, 450, 0, 0, 450, 0, 0],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(113);
  });

  it('counts an every-2-months partner who gave on schedule', () => {
    const contact = buildContact({
      pledgeAmount: 200,
      pledgeFrequency: '2.0',
      gifts: [0, 200, 0, 200, 0, 200, 0, 200, 0, 200, 0, 200, 0],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(100);
  });

  it('converts a commitment in another currency at the rate its gifts were converted', () => {
    const contact = buildContact({
      rate: 56,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact, 'PHP')).toBe(5600);
  });

  it('leaves out gifts above a commitment in another currency', () => {
    const contact = buildContact({
      rate: 56,
      gifts: [0, 400, ...monthly(100, 11)],
    });

    expect(getSolidMonthlySupport(contact, 'PHP')).toBe(5600);
  });

  it('converts at the rate of months whose gifts were all in the commitment currency', () => {
    const contact = buildContact({
      rate: 56,
      gifts: [0, ...monthly(100, 12)],
    });
    // A month with an extra gift in another currency, converted at a different rate
    contact.months[1] = {
      ...contact.months[1],
      total: 100 * 56 + 50 * 41,
      salaryCurrencyTotal: 100 * 56 + 50 * 41,
      donations: [
        ...contact.months[1].donations,
        {
          amount: 50,
          date: '2020-11-01',
          paymentMethod: null,
          currency: 'CAD',
        },
      ],
    };

    expect(getSolidMonthlySupport(contact, 'PHP')).toBe(5600);
  });

  it('counts nothing when no gift was in the commitment currency', () => {
    const contact = buildContact({
      pledgeCurrency: 'CAD',
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('counts nothing for a contact who is not a financial partner', () => {
    const contact = buildContact({
      status: StatusEnum.PartnerSpecial,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('counts nothing for a financial partner with no commitment amount', () => {
    const contact = buildContact({
      pledgeAmount: null,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  it('counts nothing for a financial partner with no commitment frequency', () => {
    const contact = buildContact({
      pledgeFrequency: null,
      gifts: [0, ...monthly(100, 12)],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });
});
