import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { getLocalizedReminderStatus } from './getLocalizedReminderStatus';

const t = (key: string) => key;

describe('getLocalizedReminderStatus', () => {
  it.each([
    [MinistryPartnerReminderFrequencyEnum.Monthly, 'Monthly'],
    [MinistryPartnerReminderFrequencyEnum.Bimonthly, 'Bi-Monthly'],
    [MinistryPartnerReminderFrequencyEnum.Quarterly, 'Quarterly'],
    [MinistryPartnerReminderFrequencyEnum.SemiAnnually, 'Semi-Annually'],
    [MinistryPartnerReminderFrequencyEnum.Annually, 'Annually'],
    [MinistryPartnerReminderFrequencyEnum.DoNotRemind, 'Do Not Remind'],
    [MinistryPartnerReminderFrequencyEnum.NotReminded, 'Not Reminded'],
  ])('maps %s to "%s"', (status, expected) => {
    expect(getLocalizedReminderStatus(t, status)).toBe(expected);
  });

  it('falls back to "Not Reminded" for undefined', () => {
    expect(getLocalizedReminderStatus(t, undefined)).toBe('Not Reminded');
  });
});
