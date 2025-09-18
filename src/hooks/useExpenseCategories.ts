import { useMemo } from 'react';
import { ExpenseCategoriesEnum } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import { DataFields } from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';

export function useExpenseCategories(data: DataFields[]) {
  return useMemo(() => {
    const ministry: DataFields[] = [];
    const healthcare: DataFields[] = [];
    const assessment: DataFields[] = [];
    const other: DataFields[] = [];

    data.forEach((item) => {
      const category =
        item.description.split(' - ').length > 1
          ? item.description.split(' - ')[0]
          : item.description;

      if (category === ExpenseCategoriesEnum.Ministry) {
        ministry.push(item);
      } else if (category === ExpenseCategoriesEnum.Healthcare) {
        healthcare.push(item);
      } else if (
        category === ExpenseCategoriesEnum.Assessment ||
        category === ExpenseCategoriesEnum.AdditionalSalary ||
        category === ExpenseCategoriesEnum.Benefits ||
        category === ExpenseCategoriesEnum.Salary
      ) {
        assessment.push(item);
      } else {
        other.push(item);
      }
    });

    return { ministry, healthcare, assessment, other };
  }, [data]);
}
