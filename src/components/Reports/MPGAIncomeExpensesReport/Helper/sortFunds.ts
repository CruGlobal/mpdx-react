import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';

const incomeCategoryOrder: StaffExpenseCategoryEnum[] = [
  StaffExpenseCategoryEnum.Donation,
  StaffExpenseCategoryEnum.AccountTransfer,
  StaffExpenseCategoryEnum.Transfer,
];

const expenseCategoryOrder: StaffExpenseCategoryEnum[] = [
  StaffExpenseCategoryEnum.Salary,
  StaffExpenseCategoryEnum.AdditionalSalary,
  StaffExpenseCategoryEnum.Benefits,
  StaffExpenseCategoryEnum.HealthcareReimbursement,
  StaffExpenseCategoryEnum.MinistryReimbursement,
  StaffExpenseCategoryEnum.AccountTransfer,
  StaffExpenseCategoryEnum.Transfer,
  StaffExpenseCategoryEnum.Assessment,
];

const createCategoryRank = (order: StaffExpenseCategoryEnum[]) => {
  const ranks = new Map(order.map((category, index) => [category, index]));
  // Listed categories rank 0…n-1; anything unlisted sorts after them, and
  // Other always sorts last.
  const unrankedRank = order.length;
  const otherRank = order.length + 1;

  return (category?: StaffExpenseCategoryEnum): number => {
    if (category === StaffExpenseCategoryEnum.Other) {
      return otherRank;
    }
    return (category && ranks.get(category)) ?? unrankedRank;
  };
};

export const incomeCategoryRank = createCategoryRank(incomeCategoryOrder);
export const expenseCategoryRank = createCategoryRank(expenseCategoryOrder);
