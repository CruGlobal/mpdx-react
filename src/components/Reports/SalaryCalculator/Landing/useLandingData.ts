import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Maybe, SecaStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useHcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { useSalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useAccountBalanceQuery } from './AccountBalance.generated';

interface SalaryCategory {
  category: string;
  user: string | Maybe<SecaStatusEnum> | undefined;
  spouse: string | Maybe<SecaStatusEnum> | undefined;
  link?: string;
  tooltip?: string;
}

export const useLandingData = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: hcmData, loading: hcmLoading } = useHcmQuery();
  const { data: calculationData, loading: calculationLoading } =
    useSalaryCalculationQuery();
  const { data: accountBalanceData, loading: accountBalanceLoading } =
    useAccountBalanceQuery();

  const { self, spouse, hasSpouse } = useMemo(() => {
    const [selfData, spouseData] = hcmData?.hcm ?? [];
    return {
      self: selfData,
      spouse: spouseData,
      hasSpouse: hcmData?.hcm?.length === 2,
    };
  }, [hcmData]);

  const staffAccountIds = useMemo(() => {
    if (!self?.staffInfo?.id) {
      return '';
    }
    if (!hasSpouse || !spouse?.staffInfo?.id) {
      return self.staffInfo.id;
    }
    return `${self.staffInfo.id} and ${spouse.staffInfo.id}`;
  }, [self, spouse, hasSpouse]);

  const names = useMemo(() => {
    if (!self?.staffInfo?.firstName || !self?.staffInfo?.lastName) {
      return '';
    }
    const selfName = `${self.staffInfo.lastName}, ${self.staffInfo.firstName}`;
    if (!hasSpouse || !spouse?.staffInfo?.firstName) {
      return selfName;
    }
    return `${selfName} and ${spouse.staffInfo.firstName}`;
  }, [self, spouse, hasSpouse]);

  const salaryData = useMemo(() => {
    const currentGrossSalary = self?.currentSalary.grossSalaryAmount ?? 0;
    const lastUpdated = self?.currentSalary.lastUpdated ?? '';
    const spouseCurrentGrossSalary =
      spouse?.currentSalary.grossSalaryAmount ?? 0;

    const rothContribution =
      self?.fourOThreeB.currentRothContributionPercentage ?? 0;
    const spouseRothContribution =
      spouse?.fourOThreeB.currentRothContributionPercentage ?? 0;

    const taxDeferredContribution =
      self?.fourOThreeB.currentTaxDeferredContributionPercentage ?? 0;
    const spouseTaxDeferredContribution =
      spouse?.fourOThreeB.currentTaxDeferredContributionPercentage ?? 0;

    return {
      currentGrossSalary,
      lastUpdated,
      spouseCurrentGrossSalary,
      rothContribution,
      spouseRothContribution,
      taxDeferredContribution,
      spouseTaxDeferredContribution,
    };
  }, [self, spouse]);

  const accountBalance = useMemo(
    () =>
      accountBalanceData?.reportsStaffExpenses?.funds?.reduce(
        (sum, fund) => sum + (fund.total ?? 0),
        0,
      ) ?? 0,
    [accountBalanceData],
  );

  const calculation = useMemo(
    () => calculationData?.salaryRequest,
    [calculationData],
  );

  const salaryCategories = useMemo<SalaryCategory[]>(
    () => [
      {
        category: t('Maximum Allowable Salary'),
        user: calculation?.salaryCap
          ? currencyFormat(calculation.salaryCap, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: calculation?.spouseSalaryCap
          ? currencyFormat(calculation.spouseSalaryCap, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
      },
      {
        category: t('Requested Salary'),
        user: calculation?.salary
          ? currencyFormat(calculation.salary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: calculation?.spouseSalary
          ? currencyFormat(calculation.spouseSalary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        tooltip: t(
          'Requested Salary includes MHA and taxes if applicable. It does not include 403(b) Contributions and SECA.',
        ),
      },
      {
        category: t('Tax-deferred 403(b) Contribution'),
        user: salaryData.taxDeferredContribution
          ? percentageFormat(salaryData.taxDeferredContribution / 100, locale)
          : '-',
        spouse: salaryData.spouseTaxDeferredContribution
          ? percentageFormat(
              salaryData.spouseTaxDeferredContribution / 100,
              locale,
            )
          : '-',
      },
      {
        category: t('Roth 403(b) Contribution'),
        user: salaryData.rothContribution
          ? percentageFormat(salaryData.rothContribution / 100, locale)
          : '-',
        spouse: salaryData.spouseRothContribution
          ? percentageFormat(salaryData.spouseRothContribution / 100, locale)
          : '-',
      },
      {
        category: t('Security (SECA/FICA) Status'),
        user: self?.staffInfo.secaStatus,
        spouse: spouse?.staffInfo.secaStatus,
      },
      {
        category: t('Gross Requested Salary'),
        user: calculation?.salary
          ? currencyFormat(calculation.salary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: calculation?.spouseSalary
          ? currencyFormat(calculation.spouseSalary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        tooltip: t(
          'Gross Requested Salary includes MHA, 403(b), SECA, and taxes if applicable.',
        ),
      },
      {
        category: t('Current MHA (Included in Gross Salary)'),
        user: calculation?.mhaAmount
          ? currencyFormat(calculation.mhaAmount, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: calculation?.spouseMhaAmount
          ? currencyFormat(calculation.spouseMhaAmount, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        link: '/reports/housingAllowance',
      },
    ],
    [t, salaryData, self, spouse, calculation, locale],
  );

  return {
    loading: hcmLoading || calculationLoading || accountBalanceLoading,
    staffAccountIds,
    names,
    self,
    spouse,
    hasSpouse,
    salaryData,
    salaryCategories,
    accountBalance,
    // TODO: replace isNewStaff with value from API when available
    isNewStaff: false,
  };
};
