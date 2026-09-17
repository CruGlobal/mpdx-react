import { StaffExpensesSubCategoryEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getLocalizedSubCategory } from './transformStaffExpenseEnums';

describe('transformStaffExpenseEnums', () => {
  describe('getLocalizedSubCategory', () => {
    it('falls back to an unknown label for a subcategory it does not know', () => {
      expect(
        getLocalizedSubCategory(
          'BRAND_NEW_SUBCATEGORY' as StaffExpensesSubCategoryEnum,
          i18n.t,
        ),
      ).toBe('Unknown Subcategory');
    });
  });
});
