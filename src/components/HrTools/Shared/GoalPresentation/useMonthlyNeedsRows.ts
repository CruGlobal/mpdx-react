import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportNeedsRow } from './SupportNeedsTable';

export interface MonthlyNeeds {
  married: boolean;
  salary: number;
  ministryExpenses: number;
  benefits: number;
  socialSecurityAndTaxes: number;
  voluntaryRetirement: number;
  adminCharge: number;
}

/**
 * Build the monthly support needs rows shared by the goal presentation table and chart.
 */
export const useMonthlyNeedsRows = ({
  married,
  salary,
  ministryExpenses,
  benefits,
  socialSecurityAndTaxes,
  voluntaryRetirement,
  adminCharge,
}: MonthlyNeeds): SupportNeedsRow[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: married ? t('Salary (Combined)') : t('Salary'),
        description: t(
          'Salaries are based upon marital status, number of children, tenure with Cru, and adjustments for certain geographic locations.',
        ),
        amount: salary,
      },
      {
        title: t('Ministry Expenses'),
        description: t(
          'Training, conferences, supplies, evangelism & discipleship materials, communication with ministry partners, ministry travel expenses, etc.',
        ),
        amount: ministryExpenses,
      },
      {
        title: t('Benefits'),
        description: t(
          "Includes group medical and dental coverage, life insurance, disability insurance, worker's compensation, and employer contribution to a 403(b) retirement plan.",
        ),
        amount: benefits,
      },
      {
        title: t('Social Security and Taxes'),
        description: t(
          'Since Campus Crusade is a non-profit organization, staff members are responsible for paying the entire amount of Social Security.',
        ),
        amount: socialSecurityAndTaxes,
      },
      {
        title: t('Voluntary 403b Retirement Plan'),
        description: t(
          'Staff members are eligible to contribute to a voluntary retirement program each month.',
        ),
        amount: voluntaryRetirement,
      },
      {
        title: t('Administrative Charge'),
        amount: adminCharge,
        titleBold: false,
      },
    ],
    [
      married,
      salary,
      ministryExpenses,
      benefits,
      socialSecurityAndTaxes,
      voluntaryRetirement,
      adminCharge,
      t,
    ],
  );
};
