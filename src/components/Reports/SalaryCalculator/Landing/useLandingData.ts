import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useStaffAccountQuery } from '../../StaffAccount.generated';
import { useHcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { useSalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useAccountBalanceQuery } from './AccountBalance.generated';

export const useLandingData = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: staffAccountData, loading: staffLoading } =
    useStaffAccountQuery();
  const { data: hcmData, loading: hcmLoading } = useHcmQuery();
  const { data: calculationData, loading: calculationLoading } =
    useSalaryCalculationQuery();
  const { data: accountBalanceData, loading: accountBalanceLoading } =
    useAccountBalanceQuery();

  const staffAccountId = useMemo(
    () => staffAccountData?.staffAccount?.id,
    [staffAccountData],
  );

  const { self, spouse, hasSpouse } = useMemo(() => {
    const [selfData, spouseData] = hcmData?.hcm ?? [];
    return {
      self: selfData,
      spouse: spouseData,
      hasSpouse: hcmData?.hcm?.length === 2,
    };
  }, [hcmData]);

  const name = useMemo(() => {
    if (self?.staffInfo.firstName && self?.staffInfo.lastName) {
      return `${self.staffInfo.lastName}, ${self.staffInfo.firstName}`;
    }
    return '';
  }, [self]);

  // const supportStatus = useMemo(() => {
  //   return self?.staffInfo.peopleGroupSupportType;
  // }, [self]);
  // console.log('supportStatus', supportStatus);

  const salaryData = useMemo(() => {
    const currentGrossSalary = self?.currentSalary.grossSalaryAmount ?? 0;
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

  const salaryCategories = useMemo(
    () => [
      {
        category: t('Gross Salary'),
        user: salaryData.currentGrossSalary,
        spouse: salaryData.spouseCurrentGrossSalary,
      },
      {
        category: t('Security (SECA/FICA) Status'),
        user: self?.staffInfo.secaStatus,
        spouse: spouse?.staffInfo.secaStatus,
      },
      {
        category: t('Tax-deferred 403(b) Contribution'),
        user: salaryData.taxDeferredContribution
          ? `${salaryData.taxDeferredContribution}%`
          : '0%',
        spouse: salaryData.spouseTaxDeferredContribution
          ? `${salaryData.spouseTaxDeferredContribution}%`
          : '0%',
      },
      {
        category: t('Roth 403(b) Contribution'),
        user: salaryData.rothContribution
          ? `${salaryData.rothContribution}%`
          : '0%',
        spouse: salaryData.spouseRothContribution
          ? `${salaryData.spouseRothContribution}%`
          : '0%',
      },
      {
        category: t('Maximum Allowable Salary (CAP)'),
        user: calculation?.salaryCap
          ? currencyFormat(calculation.salaryCap, 'USD', locale)
          : '-',
        spouse: calculation?.spouseSalaryCap
          ? currencyFormat(calculation.spouseSalaryCap, 'USD', locale)
          : '-',
      },
      {
        category: t('Current MHA'),
        user: calculation?.mhaAmount
          ? currencyFormat(calculation.mhaAmount, 'USD', locale)
          : '-',
        spouse: calculation?.spouseMhaAmount
          ? currencyFormat(calculation.spouseMhaAmount, 'USD', locale)
          : '-',
      },
    ],
    [t, salaryData, self, spouse, calculation, locale],
  );

  return {
    loading:
      staffLoading || hcmLoading || calculationLoading || accountBalanceLoading,
    staffAccountId,
    name,
    self,
    spouse,
    hasSpouse,
    // supportStatus,
    currentGrossSalary: salaryData.currentGrossSalary,
    spouseCurrentGrossSalary: salaryData.spouseCurrentGrossSalary,
    rothContribution: salaryData.rothContribution,
    spouseRothContribution: salaryData.spouseRothContribution,
    taxDeferredContribution: salaryData.taxDeferredContribution,
    spouseTaxDeferredContribution: salaryData.spouseTaxDeferredContribution,
    salaryCategories,
    accountBalance,
  };
};
