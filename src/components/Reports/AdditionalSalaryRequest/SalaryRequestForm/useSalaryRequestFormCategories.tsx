import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

interface Category {
  key: string;
  label: string;
  description?: string;
}

export const useCompleteFormCategories = (): Category[] => {
  const { t } = useTranslation();
  const currentYear = DateTime.now().year;

  return [
    {
      key: 'currentYearSalary',
      label: t(
        "Current year's ({{year}}) salary not received due to inadequate support",
        { year: currentYear },
      ),
      description: t(
        'i.e. short paychecks-no approval is needed so section B does not need to be filled out.',
      ),
    },
    {
      key: 'previousYearSalary',
      label: t("Previous year's salary not received due to inadequate support"),
    },
    {
      key: 'additionalSalary',
      label: t(
        'Additional salary not exceeding your Maximum Allowable Salary level',
      ),
    },
    {
      key: 'adoption',
      label: t('Adoption'),
      description: t('$15,000.00 Maximum, per adoption, not per year'),
    },
    {
      key: 'contribution403b',
      label: t('403(b) Contribution'),
      description: t(
        '100% of what you enter here will be contributed to your 403(b)',
      ),
    },
    {
      key: 'counseling',
      label: t(
        'Counseling that is not for the treatment of a medical condition',
      ),
      description: t('i.e. marital, family or spiritual issues'),
    },
    {
      key: 'healthcareExpenses',
      label: t('Healthcare expenses that exceed the annual reimbursable limit'),
    },
    {
      key: 'babysitting',
      label: t('Babysitting for ministry meetings, training, and retreats'),
    },
    {
      key: 'childrenMinistryTrip',
      label: t("Children's expenses on a ministry trip"),
      description: t('Support raising, Staff Conference, etc.'),
    },
    {
      key: 'childrenCollege',
      label: t("Children's college education"),
      description: t('$21,000.00 Maximum per year, per child'),
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
      description: t('Maximum amount is $50,000 for primary home'),
    },
    { key: 'autoPurchase', label: t('Auto purchase') },
    {
      key: 'reimbursableExpenses',
      label: t('Reimbursable expenses that were not approved within 90 days'),
    },
  ];
};
