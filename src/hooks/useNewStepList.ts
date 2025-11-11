import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Steps } from '../components/Reports/MinisterHousingAllowance/NewRequest/StepsList/StepsList';
import { PageEnum } from '../components/Reports/MinisterHousingAllowance/Shared/sharedTypes';

export function useNewStepList(type: PageEnum): Steps[] {
  const { t } = useTranslation();

  const steps =
    type === PageEnum.New
      ? [
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
        ]
      : [
          {
            title: t('1. Rent or Own?'),
            current: true,
            complete: false,
          },
          {
            title: t('2. Edit Your MHA'),
            current: false,
            complete: false,
          },
          {
            title: t('3. Receipt'),
            current: false,
            complete: false,
          },
        ];

  return useMemo(() => steps, [t]);
}
