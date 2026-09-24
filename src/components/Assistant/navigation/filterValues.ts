import { ContactFilterNewsletterEnum } from 'src/graphql/types.generated';
import { NewsletterValue, PledgeFrequency } from './intents';

// The contact filter takes the frequency as a number of months, the key in mpdx-assistant knowledge/labels/en.json
export const PLEDGE_FREQUENCY_FILTER_VALUES: Record<PledgeFrequency, string> = {
  WEEKLY: '0.23076923076923',
  EVERY_2_WEEKS: '0.46153846153846',
  MONTHLY: '1.0',
  EVERY_2_MONTHS: '2.0',
  QUARTERLY: '3.0',
  EVERY_4_MONTHS: '4.0',
  EVERY_6_MONTHS: '6.0',
  ANNUAL: '12.0',
  EVERY_2_YEARS: '24.0',
};

// The filter takes one option and its PHYSICAL means physical or both, so only these sets can be expressed
const NEWSLETTER_FILTER_OPTIONS: Array<
  [NewsletterValue[], ContactFilterNewsletterEnum]
> = [
  [['PHYSICAL'], ContactFilterNewsletterEnum.PhysicalOnly],
  [['EMAIL'], ContactFilterNewsletterEnum.EmailOnly],
  [['BOTH'], ContactFilterNewsletterEnum.Both],
  [['NONE'], ContactFilterNewsletterEnum.None],
  [['PHYSICAL', 'BOTH'], ContactFilterNewsletterEnum.Physical],
  [['EMAIL', 'BOTH'], ContactFilterNewsletterEnum.Email],
  [['PHYSICAL', 'EMAIL', 'BOTH'], ContactFilterNewsletterEnum.All],
];

export const getNewsletterFilterValue = (
  values: NewsletterValue[],
): ContactFilterNewsletterEnum | null => {
  const selected = new Set(values);
  const match = NEWSLETTER_FILTER_OPTIONS.find(
    ([option]) =>
      option.length === selected.size &&
      option.every((value) => selected.has(value)),
  );
  return match?.[1] ?? null;
};
