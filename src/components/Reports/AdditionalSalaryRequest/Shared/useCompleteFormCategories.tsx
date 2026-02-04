import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

// TODO Get these fields from the API when available

interface Category {
  key: string;
  label: string;
  description?: string;
}

export const useCompleteFormCategories = (): Category[] => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { currentYear, salaryInfo } = useAdditionalSalaryRequest();

  return [
    {
      key: 'currentYearSalaryNotReceived',
      label: t(
        "Current year's ({{year}}) salary not received due to inadequate support",
        { year: currentYear },
      ),
      description: t(
        'i.e. short paychecks-no approval is needed so section B does not need to be filled out.',
      ),
    },
    {
      key: 'previousYearSalaryNotReceived',
      label: t("Previous year's salary not received due to inadequate support"),
    },
    {
      key: 'additionalSalaryWithinMax',
      label: t(
        'Additional salary not exceeding your Maximum Allowable Salary level',
      ),
    },
    {
      key: 'adoption',
      label: t('Adoption'),
      description: t('{{max}} Maximum, per adoption, not per year', {
        max: currencyFormat(salaryInfo?.maxAdoptionUss ?? 0, currency, locale),
      }),
    },
    {
      key: 'traditional403bContribution',
      label: t('403(b) Contribution'),
      description: t(
        '100% of what you enter here will be contributed to your 403(b)',
      ),
    },
    {
      key: 'counselingNonMedical',
      label: t(
        'Counseling that is not for the treatment of a medical condition',
      ),
      description: t('i.e. marital, family or spiritual issues'),
    },
    {
      key: 'healthcareExpensesExceedingLimit',
      label: t('Healthcare expenses that exceed the annual reimbursable limit'),
    },
    {
      key: 'babysittingMinistryEvents',
      label: t('Babysitting for ministry meetings, training, and retreats'),
    },
    {
      key: 'childrenMinistryTripExpenses',
      label: t("Children's expenses on a ministry trip"),
      description: t('Support raising, Staff Conference, etc.'),
    },
    {
      key: 'childrenCollegeEducation',
      label: t("Children's college education"),
      description: t('{{max}} Maximum per year, per child', {
        max: currencyFormat(salaryInfo?.maxCollegeUss ?? 0, currency, locale),
      }),
    },
    { key: 'movingExpense', label: t('Moving Expense') },
    {
      key: 'seminary',
      label: t('Seminary'),
      description: t('For full-time seminary staff'),
    },
    {
      key: 'housingDownPayment',
      label: t('Housing Down Payment'),
      description: t('Maximum amount is {{max}} for primary home', {
        max: currencyFormat(
          salaryInfo?.maxHousingDownPaymentUss ?? 0,
          currency,
          locale,
        ),
      }),
    },
    {
      key: 'autoPurchase',
      label: t('Auto purchase'),
      description: t('Maximum amount is {{max}}', {
        max: currencyFormat(
          salaryInfo?.maxAutoPurchaseUss ?? 0,
          currency,
          locale,
        ),
      }),
    },
    {
      key: 'expensesNotApprovedWithin90Days',
      label: t('Reimbursable expenses that were not approved within 90 days'),
    },
  ];
};
