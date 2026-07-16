import { useMemo } from 'react';
import { DataFields } from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';

const sum = (rows: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export function useExpenseCategories(data: DataFields[]) {
  return useMemo(() => {
    const ministry: DataFields[] = [];
    const healthcare: DataFields[] = [];
    const assessment: DataFields[] = [];
    const benefits: DataFields[] = [];
    const salary: DataFields[] = [];
    const other: DataFields[] = [];

    data.forEach((item) => {
      const category =
        item.description.split(' - ').length > 1
          ? item.description.split(' - ')[0]
          : item.description;

      if (category === 'Ministry Reimbursement') {
        ministry.push(item);
      } else if (category === 'Healthcare Reimbursement') {
        healthcare.push(item);
      } else if (category === 'Assessment') {
        assessment.push(item);
      } else if (category === 'Benefits') {
        benefits.push(item);
      } else if (category === 'Salary') {
        salary.push(item);
      } else {
        other.push(item);
      }
    });

    const ministryTotal = sum(ministry);

    const healthcareTotal = sum(healthcare);

    const assessmentTotal = sum(assessment);

    const benefitsTotal = sum(benefits);

    const salaryTotal = sum(salary);

    const otherTotal = sum(other);

    const expensesTotal =
      ministryTotal +
      healthcareTotal +
      assessmentTotal +
      benefitsTotal +
      salaryTotal +
      otherTotal;

    return {
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      benefitsTotal,
      salaryTotal,
      otherTotal,
      expensesTotal,
    };
  }, [data]);
}
