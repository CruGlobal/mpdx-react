import { TFunction } from 'i18next';

/**
 * How the report's New Staff Monthly Salary is calculated, shared by the
 * "How this report works" legend and the drawer's tooltip. It mirrors the API's
 * Reports::StaffSalaryCalculator#new_staff_monthly_salary. The report passes no
 * debt payments, so debt is deliberately not mentioned.
 */
export const newStaffSalaryCopy = (t: TFunction) => ({
  title: t('New Staff Monthly Salary'),
  body: t(
    "The monthly salary a new staff member in the same situation would receive. It is calculated from HR records for the staff member (and their spouse, if married) using the current year's New Staff goal rates, then added together and divided by 12:",
  ),
  steps: [
    t(
      'Base salary: the annual base salary for their marital status, number of dependent children on healthcare, and age range, multiplied by the geographic multiplier for their location.',
    ),
    t('Plus a tenure adjustment based on years on staff.'),
    t(
      "If a couple's combined salary would be over the salary cap, both salaries are reduced proportionally to the cap.",
    ),
    t(
      'Plus SECA (Social Security) tax on that salary, unless they have opted out of SECA.',
    ),
    t('Plus the 403(b) retirement contribution.'),
  ],
  footer: t(
    "Change the Geographic Multiplier in the staff member's details to recalculate it.",
  ),
});

/** The shorter New Staff Monthly Salary explanation used in the drawer's tooltip. */
export const newStaffSalaryTooltip = (t: TFunction): string =>
  t(
    'The monthly salary a new staff member in the same situation would receive: base salary for their marital status, children and age × geographic multiplier, plus tenure adjustment, plus SECA and 403(b). Combined with their spouse\'s and divided by 12. See "How this report works" for details.',
  );
