import { ContactFilterNewsletterEnum } from 'src/graphql/types.generated';
import { NewsletterValue, PledgeFrequency } from './intents';

export const PLEDGE_FREQUENCY_FILTER_VALUES: Record<PledgeFrequency, string> = {
  Weekly: '0.23076923076923',
  'Every 2 Weeks': '0.46153846153846',
  Monthly: '1.0',
  'Every 2 Months': '2.0',
  Quarterly: '3.0',
  'Every 4 Months': '4.0',
  'Every 6 Months': '6.0',
  Annual: '12.0',
  'Every 2 Years': '24.0',
};

// The newsletter filter takes one option, so only the sets it offers can be expressed
const NEWSLETTER_FILTER_OPTIONS: Array<
  [NewsletterValue[], ContactFilterNewsletterEnum]
> = [
  [['Physical'], ContactFilterNewsletterEnum.PhysicalOnly],
  [['Email'], ContactFilterNewsletterEnum.EmailOnly],
  [['Both'], ContactFilterNewsletterEnum.Both],
  [['None'], ContactFilterNewsletterEnum.None],
  [['Physical', 'Both'], ContactFilterNewsletterEnum.Physical],
  [['Email', 'Both'], ContactFilterNewsletterEnum.Email],
  [['Physical', 'Email', 'Both'], ContactFilterNewsletterEnum.All],
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
