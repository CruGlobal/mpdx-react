import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface NewRequestStep {
  title: string;
  current: boolean;
  complete: boolean;
}

export function useNewStepList(): NewRequestStep[] {
  const { t } = useTranslation();

  const steps: NewRequestStep[] = [
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

  return useMemo(() => steps, [t]);
}
