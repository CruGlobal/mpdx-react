import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../components/Reports/Shared/CalculationReports/StepsList/StepsList';
import { useLocalStorage } from './useLocalStorage';

export function useStepList(
  formType: FormEnum,
  type?: PageEnum,
  storageKey?: string,
) {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useLocalStorage(
    storageKey ?? 'default-key',
    0,
  );

  const [steps, setSteps] = useState<Steps[]>(() => {
    const baseSteps =
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

    return baseSteps.map((step, index) => ({
      ...step,
      current: index === currentIndex,
      complete:
        index < currentIndex ||
        (index === currentIndex && currentIndex === baseSteps.length - 1),
    }));
  });

  const percentComplete = ((currentIndex + 1) / steps.length) * 100;

  const nextStep = useCallback(() => {
    const newIndex = currentIndex + 1;
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        if (index === currentIndex) {
          return {
            ...step,
            current: false,
            complete: true,
          };
        }

        if (index === newIndex) {
          return {
            ...step,
            current: true,
            complete: newIndex === prevSteps.length - 1 ? true : step.complete,
          };
        }
        return step;
      }),
    );
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const previousStep = useCallback(() => {
    const newIndex = currentIndex - 1;
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        if (index === currentIndex) {
          return { ...step, current: false };
        }

        if (index === newIndex) {
          return {
            ...step,
            current: true,
            complete: false,
          };
        }
        return step;
      }),
    );
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const resetSteps = useCallback(() => {
    setCurrentIndex(0);
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => ({
        ...step,
        current: index === 0,
        complete: false,
      })),
    );
  }, []);

  return {
    steps,
    nextStep,
    previousStep,
    currentIndex,
    percentComplete,
    resetSteps,
  };
}
