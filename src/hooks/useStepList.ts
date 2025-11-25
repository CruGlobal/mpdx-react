import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../components/Reports/Shared/CalculationReports/StepsList/StepsList';

export function useStepList(formType: FormEnum, type?: PageEnum): Steps[] {
  const { t } = useTranslation();

  const steps =
    formType === FormEnum.MHA
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
        ]
      : formType === FormEnum.SalaryCalc
        ? [
            {
              title: t('1. Effective Date'),
              current: true,
              complete: false,
            },
            {
              title: t('2. Your Information'),
              current: false,
              complete: false,
            },
            {
              title: t('3. Salary Calculation'),
              current: false,
              complete: false,
            },
            {
              title: t('4. Summary'),
              current: false,
              complete: false,
            },
            {
              title: t('5. Receipt'),
              current: false,
              complete: false,
            },
          ]
        : formType === FormEnum.AdditionalSalary
          ? [
              {
                title: t('1. About this Form'),
                current: true,
                complete: false,
              },
              {
                title: t('2. Complete Form'),
                current: false,
                complete: false,
              },
              {
                title: t('3. Receipt'),
                current: false,
                complete: false,
              },
            ]
          : [];

  return useMemo(() => steps, [t, type, formType]);
}
