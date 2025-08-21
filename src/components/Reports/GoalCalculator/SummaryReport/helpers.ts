export const getSubcategoryTotal = (
  family,
  primaryCategoryName,
  subcategoryName,
) => {
  if (!family?.primaryBudgetCategories) {
    return 0;
  }

  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );
  const subCategory =
    primary?.subBudgetCategories.find(
      (item) => item.category === subcategoryName,
    ) ?? [];

  return subCategory.reduce((sum, sub) => sum + (sub?.amount ?? 0), 0) ?? 0;
};

export const getPrimaryCategoryTotal = (
  family,
  primaryCategoryName,
): number => {
  if (!family?.primaryBudgetCategories) {
    return 0;
  }

  const primary = family.primaryBudgetCategories.find(
    (item) => item.category === primaryCategoryName,
  );

  return (
    primary?.subBudgetCategories?.reduce(
      (sum: number, sub) => sum + (sub?.amount ?? 0),
      0,
    ) ?? 0
  );
};
