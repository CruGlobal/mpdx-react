import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEnum } from '../components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { Steps } from '../components/Reports/MinisterHousingAllowance/Steps/StepsList/StepsList';

export function useNewStepList(type: PageEnum): Steps[] {
  const { t } = useTranslation();

  const steps = [
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
      title:
        type === PageEnum.New
          ? t('3. Calculate Your MHA')
          : t('3. Edit Your MHA'),
      current: false,
      complete: false,
    },
    {
      title: t('4. Receipt'),
      current: false,
      complete: false,
    },
  ];

  return useMemo(() => steps, [t, type]);
}
