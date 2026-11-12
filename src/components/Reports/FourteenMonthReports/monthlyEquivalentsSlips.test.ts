import { getSolidMonthlySupport } from './monthlyEquivalents';
import { buildContact, monthly } from './monthlyEquivalents.mock';

// A gift that slips from the 31st to the 1st empties one month and doubles the next
describe('getSolidMonthlySupport month-end slips', () => {
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

  // MPDX-10193 review #25: a late gift lands in the newer month
  it('pairs an empty month with the newer month first on a run of late gifts', () => {
    const contact = buildContact({
      gifts: [0, 200, 0, 200, 0, 100, 200, 0, 200, 0, 100, 0, 100],
    });

    // $1,100 over 12 months, with one month missed
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(92);
  });

  it('lets a double gift in the current month make up for last month', () => {
    const contact = buildContact({
      gifts: [200, 0, 0, 0, ...monthly(100, 9)],
    });

    // $900 over 12 months, with two months missed
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(75);
  });

  // MPDX-10193 review #27: an extra gift is measured by amount, not by count
  it('leaves out a partner who splits each gift in two and missed 4 months', () => {
    const contact = buildContact({
      gifts: [
        0,
        [50, 50],
        0,
        [50, 50],
        0,
        [50, 50],
        0,
        [50, 50],
        0,
        ...Array(4).fill([50, 50]),
      ],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  // MPDX-10193 review #26: a 5-week month is a weekly partner's normal pattern
  it('leaves out a weekly partner who stopped 3 months ago after a 5-week month', () => {
    const contact = buildContact({
      pledgeAmount: 25,
      pledgeFrequency: '0.23',
      gifts: [
        0,
        0,
        0,
        0,
        Array(5).fill(25),
        ...Array(8).fill(Array(4).fill(25)),
      ],
    });

    expect(getSolidMonthlySupport(contact, 'USD')).toBe(0);
  });

  // MPDX-10193 review #39: a doubled month only has to come close to twice the commitment
  it('still counts a partner who gives a little under their commitment and whose gifts slipped', () => {
    const contact = buildContact({
      gifts: [0, 90, 180, 0, 90, 180, 0, 90, 180, 0, 90, 90, 90],
    });

    // $1,080 over 12 months
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(90);
  });

  it('still counts a slip in another currency converted at a lower rate that month', () => {
    const contact = buildContact({
      pledgeCurrency: 'CAD',
      giftCurrency: 'CAD',
      rate: 0.75,
      gifts: [0, 100, 200, 0, 100, 200, 0, 100, 200, 0, 100, 100, 100],
    });
    // The doubled months were converted at 0.74, below the average rate
    [2, 5, 8].forEach((index) => {
      contact.months[index].total = 200 * 0.74;
      contact.months[index].salaryCurrencyTotal = 200 * 0.74;
    });

    // CAD $100 at the average rate, about 0.746
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(75);
  });

  it('lets the month before the window make up for the oldest month', () => {
    const contact = buildContact({
      gifts: [0, ...monthly(100, 9), 0, 0, 0, 200],
    });

    // $900 over 12 months, with two months missed
    expect(getSolidMonthlySupport(contact, 'USD')).toBe(75);
  });
});
