import { useMemo } from 'react';
import { DataFields } from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

const sum = (rows: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export function useExpenseCategories(data: DataFields[]) {
  return useMemo(() => {
    const staffExpense: DataFields[] = [];
    const healthcare: DataFields[] = [];
    const assessment: DataFields[] = [];
    const benefits: DataFields[] = [];
    const salary: DataFields[] = [];
    const other: DataFields[] = [];

    data.forEach((item) => {
      switch (item.category) {
        case StaffExpenseCategoryEnum.HealthcareReimbursement:
          healthcare.push(item);
          break;
        case StaffExpenseCategoryEnum.Assessment:
          assessment.push(item);
          break;
        case StaffExpenseCategoryEnum.Benefits:
          benefits.push(item);
          break;
        case StaffExpenseCategoryEnum.Salary:
          salary.push(item);
          break;
        case StaffExpenseCategoryEnum.StaffExpense:
          (item.subCategory === StaffExpensesSubCategoryEnum.PaCard
            ? healthcare
            : staffExpense
          ).push(item);
          break;
        default:
          other.push(item);
      }
    });

    const staffExpenseTotal = sum(staffExpense);

    const healthcareTotal = sum(healthcare);

    const assessmentTotal = sum(assessment);

    const benefitsTotal = sum(benefits);

    const salaryTotal = sum(salary);

    const otherTotal = sum(other);

    const expensesTotal =
      staffExpenseTotal +
      healthcareTotal +
      assessmentTotal +
      benefitsTotal +
      salaryTotal +
      otherTotal;

    return {
      staffExpenseTotal,
      healthcareTotal,
      assessmentTotal,
      benefitsTotal,
      salaryTotal,
      otherTotal,
      expensesTotal,
    };
  }, [data]);
}
