import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isFullTimeRmo } from 'src/components/Reports/SalaryCalculator/staffTypeHelpers';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useHcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { getLocalizedTaxStatus } from '../Shared/getLocalizedTaxStatus';
import { useAccountBalanceQuery } from './AccountBalance.generated';
import { useLandingSalaryCalculationsQuery } from './NewSalaryCalculationLanding/LandingSalaryCalculations.generated';
import { useStaffAccountIdQuery } from './StaffAccountId.generated';

interface SalaryCategory {
  category: string;
  user: string | undefined;
  spouse: string | undefined;
  link?: string;
  tooltip?: string;
}

export const useLandingData = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data: hcmData, loading: hcmLoading } = useHcmQuery();
  const { data: calculationData, loading: calculationLoading } =
    useLandingSalaryCalculationsQuery();
  const { data: accountBalanceData, loading: accountBalanceLoading } =
    useAccountBalanceQuery();
  const { data: staffAccountIdData, loading: staffAccountIdLoading } =
    useStaffAccountIdQuery();

  const approvedCalculation = calculationData?.approvedCalculation;
  const hasInProgressCalculation = !!calculationData?.inProgressCalculation;

  const { self, spouse, hasSpouse } = useMemo(() => {
    const [selfData, spouseData] = hcmData?.hcm ?? [];
    return {
      self: selfData,
      spouse: spouseData,
      hasSpouse: hcmData?.hcm?.length === 2,
    };
  }, [hcmData]);

  const staffAccountId = useMemo(
    () => staffAccountIdData?.user?.staffAccountId,
    [staffAccountIdData],
  );

  const names = useMemo(() => {
    if (!self?.staffInfo?.preferredName || !self?.staffInfo?.lastName) {
      return '';
    }
    const selfName = `${self.staffInfo.lastName}, ${self.staffInfo.preferredName}`;
    if (!hasSpouse || !spouse?.staffInfo?.preferredName) {
      return selfName;
    }
    return `${selfName} and ${spouse.staffInfo.preferredName}`;
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

  const canCalculateSalary = useMemo(
    () => (self?.staffInfo ? isFullTimeRmo(self.staffInfo) : false),
    [self],
  );

  const salaryCategories = useMemo<SalaryCategory[]>(
    () => [
      {
        category: t('Maximum Allowable Salary'),
        user: approvedCalculation?.salaryCap
          ? currencyFormat(approvedCalculation.salaryCap, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: approvedCalculation?.spouseSalaryCap
          ? currencyFormat(approvedCalculation.spouseSalaryCap, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
      },
      {
        category: t('Requested Salary'),
        user: approvedCalculation?.salary
          ? currencyFormat(approvedCalculation.salary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: approvedCalculation?.spouseSalary
          ? currencyFormat(approvedCalculation.spouseSalary, 'USD', locale, {
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
        user: getLocalizedTaxStatus(self?.staffInfo.secaStatus, t),
        spouse: getLocalizedTaxStatus(spouse?.staffInfo.secaStatus, t),
      },
      {
        category: t('Gross Requested Salary'),
        user: salaryData.currentGrossSalary
          ? currencyFormat(salaryData.currentGrossSalary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: salaryData.spouseCurrentGrossSalary
          ? currencyFormat(salaryData.spouseCurrentGrossSalary, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        tooltip: t(
          'Gross Requested Salary includes MHA, 403(b), SECA, and taxes if applicable.',
        ),
      },
      {
        category: t('Current MHA (Included in Gross Salary)'),
        user: approvedCalculation?.mhaAmount
          ? currencyFormat(approvedCalculation.mhaAmount, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        spouse: approvedCalculation?.spouseMhaAmount
          ? currencyFormat(approvedCalculation.spouseMhaAmount, 'USD', locale, {
              showTrailingZeros: true,
            })
          : '-',
        link: '/reports/housingAllowance',
      },
    ],
    [t, salaryData, self, spouse, approvedCalculation, locale],
  );

  return {
    loading:
      hcmLoading ||
      calculationLoading ||
      accountBalanceLoading ||
      staffAccountIdLoading,
    staffAccountId,
    names,
    self,
    spouse,
    hasSpouse,
    salaryData,
    salaryCategories,
    accountBalance,
    hasInProgressCalculation,
    canCalculateSalary,
    // TODO: replace isNewStaff with value from API when available
    isNewStaff: false,
  };
};
