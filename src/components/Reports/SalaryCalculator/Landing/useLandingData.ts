import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStaffAccountQuery } from '../../StaffAccount.generated';
import { useHcmQuery } from '../SalaryCalculatorContext/Hcm.generated';

export const useLandingData = () => {
  const { t } = useTranslation();
  const { data: staffAccountData, loading: staffLoading } =
    useStaffAccountQuery();
  const { data: hcmData, loading: hcmLoading } = useHcmQuery();

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

  const salaryCategories = useMemo(
    () => [
      {
        category: t('Gross Salary'),
        user: salaryData.currentGrossSalary,
        spouse: salaryData.spouseCurrentGrossSalary,
      },
      { category: t('Taxes'), user: 0, spouse: 0 },
      {
        category: t('Security (SECA/FICA) Status'),
        user: self?.staffInfo.secaStatus,
        spouse: spouse?.staffInfo.secaStatus,
      },
      {
        category: t('Roth 403(b)'),
        user: `${salaryData.rothContribution}%`,
        spouse: `${salaryData.spouseRothContribution}%`,
      },
      {
        category: t('Tax-Deferred 403(b)'),
        user: `${salaryData.taxDeferredContribution}%`,
        spouse: `${salaryData.spouseTaxDeferredContribution}%`,
      },
    ],
    [t, salaryData, self, spouse],
  );

  return {
    loading: staffLoading || hcmLoading,
    staffAccountId,
    name,
    self,
    spouse,
    hasSpouse,
    salaryData,
    salaryCategories,
    accountBalance: 0, // TODO: Get actual account balance
  };
};
