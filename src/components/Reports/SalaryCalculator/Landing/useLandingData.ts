import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import {
  type HcmQuery,
  useHcmQuery,
} from '../SalaryCalculatorContext/Hcm.generated';
import { getLocalizedTaxStatus } from '../Shared/getLocalizedTaxStatus';
import { useAccountBalanceQuery } from './AccountBalance.generated';
import {
  type LandingSalaryCalculationsQuery,
  useLandingSalaryCalculationsQuery,
} from './NewSalaryCalculationLanding/LandingSalaryCalculations.generated';
import { useStaffAccountIdQuery } from './StaffAccountId.generated';
import { formatCalculationDates } from './dateHelpers';

interface SalaryCategory {
  category: string;
  user: string | undefined;
  spouse: string | undefined;
  link?: string;
  tooltip?: string;
}

type HcmPerson = HcmQuery['hcm'][number];

export interface LandingData {
  staffAccountId: string | null;
  names: string;
  self: HcmPerson | null;
  spouse: HcmPerson | null;
  salaryData: {
    currentGrossSalary: number;
    lastUpdated: string;
    spouseCurrentGrossSalary: number;
    rothContribution: number;
    spouseRothContribution: number;
    taxDeferredContribution: number;
    spouseTaxDeferredContribution: number;
  };
  salaryCategories: SalaryCategory[];
  accountBalance: number;
  hasInProgressCalculation: boolean;
  loading: boolean;
  calculation: LandingSalaryCalculationsQuery['latestCalculation'];
  requestedOn: string;
  processedOn: string;
  feedback: string | null;
  shouldShowPending: boolean;
}

export const useLandingData = (): LandingData => {
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
  const latestCalculation = calculationData?.latestCalculation;

  const { requestedOn, processedOn } = useMemo(
    () => formatCalculationDates(latestCalculation ?? null, locale),
    [latestCalculation, locale],
  );

  const shouldShowPending = useMemo(
    () =>
      latestCalculation?.status === SalaryRequestStatusEnum.Pending ||
      latestCalculation?.status === SalaryRequestStatusEnum.ActionRequired,
    [latestCalculation],
  );

  const feedback = useMemo(
    () => latestCalculation?.feedback ?? null,
    [latestCalculation],
  );

  const { self, spouse } = useMemo(() => {
    // Using [undefined, undefined] instead of [] ensures that we handle the case where HCM returns
    // an array with fewer than two elements
    const [selfData, spouseData] = hcmData?.hcm ?? [undefined, undefined];
    return {
      self: selfData ?? null,
      spouse: spouseData?.salaryRequestEligible ? (spouseData ?? null) : null,
    };
  }, [hcmData]);

  const staffAccountId = useMemo(
    () => staffAccountIdData?.user?.staffAccountId ?? null,
    [staffAccountIdData],
  );

  const names = useMemo(() => {
    if (!self?.staffInfo?.preferredName || !self?.staffInfo?.lastName) {
      return '';
    }
    const selfName = `${self.staffInfo.lastName}, ${self.staffInfo.preferredName}`;
    if (!spouse || !spouse?.staffInfo?.preferredName) {
      return selfName;
    }
    return `${selfName} and ${spouse.staffInfo.preferredName}`;
  }, [self, spouse]);

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
    staffAccountId,
    names,
    self,
    spouse,
    salaryData,
    salaryCategories,
    accountBalance,
    hasInProgressCalculation,
    loading:
      hcmLoading ||
      calculationLoading ||
      accountBalanceLoading ||
      staffAccountIdLoading,
    calculation: latestCalculation,
    requestedOn,
    processedOn,
    feedback,
    shouldShowPending,
  };
};
