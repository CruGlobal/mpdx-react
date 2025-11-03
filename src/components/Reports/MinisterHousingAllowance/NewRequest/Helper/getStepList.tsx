import { TFunction } from 'i18next';
import { Steps } from '../StepsList/StepsList';

export function getStepList(t: TFunction): Steps[] {
  return [
    {
      title: t('1. About this Form'),
      current: true,
      complete: false,
    },
    {
      title: t('2. Rent or Own?'),
      current: false,
      complete: false,
    },
    {
      title: t('3. Calculate Your MHA'),
      current: false,
      complete: false,
    },
    {
      title: t('4. Receipt'),
      current: false,
      complete: false,
    },
  ];
}
