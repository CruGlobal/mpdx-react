import { PLEDGE_FREQUENCY_FILTER_VALUES } from './filterValues';
import { PLEDGE_FREQUENCIES } from './intents';

describe('PLEDGE_FREQUENCY_FILTER_VALUES', () => {
  it('covers every pledge frequency and nothing else', () => {
    expect(Object.keys(PLEDGE_FREQUENCY_FILTER_VALUES).sort()).toEqual(
      [...PLEDGE_FREQUENCIES].sort(),
    );
  });

  // These must equal the pledge_frequencies keys in mpdx-assistant knowledge/labels/en.json
  it('maps each frequency to the number of months the contact filter takes', () => {
    expect(PLEDGE_FREQUENCY_FILTER_VALUES).toEqual({
      WEEKLY: '0.23076923076923',
      EVERY_2_WEEKS: '0.46153846153846',
      MONTHLY: '1.0',
      EVERY_2_MONTHS: '2.0',
      QUARTERLY: '3.0',
      EVERY_4_MONTHS: '4.0',
      EVERY_6_MONTHS: '6.0',
      ANNUAL: '12.0',
      EVERY_2_YEARS: '24.0',
    });
  });
});
