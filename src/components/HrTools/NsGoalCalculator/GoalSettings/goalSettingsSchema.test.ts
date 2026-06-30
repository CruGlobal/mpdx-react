import i18n from 'src/lib/i18n';
import { getGoalSettingsSchema } from './goalSettingsSchema';

const schema = getGoalSettingsSchema(i18n.t);

const emptyGoalSettingsValues = {
  annualRequestedSalary: '',
  contribution403bPercentage: '',
  childcareChildrenCount: '',
  tenure: '',
  reimbursableExpenses: '',
};

const validateAt = (field: string, value: unknown) =>
  schema.validateSyncAt(field, {
    ...emptyGoalSettingsValues,
    [field]: value,
  });

describe('getGoalSettingsSchema', () => {
  it('accepts the blank defaults (every numeric field empty)', () => {
    expect(() => schema.validateSync(emptyGoalSettingsValues)).not.toThrow();
  });

  it('treats an empty string as not-set rather than invalid', () => {
    expect(validateAt('annualRequestedSalary', '')).toBeNull();
  });

  it('accepts a zero amount', () => {
    expect(validateAt('annualRequestedSalary', 0)).toBe(0);
  });

  it('accepts a valid amount', () => {
    expect(validateAt('annualRequestedSalary', 41000)).toBe(41000);
  });

  it('rejects a negative amount', () => {
    expect(() => validateAt('annualRequestedSalary', -1)).toThrow();
  });

  it('rejects a percentage above 100', () => {
    expect(() => validateAt('contribution403bPercentage', 9999)).toThrow();
  });

  it('accepts a percentage within range', () => {
    expect(validateAt('contribution403bPercentage', 7)).toBe(7);
  });

  it('rejects a non-integer count', () => {
    expect(() => validateAt('childcareChildrenCount', 1.5)).toThrow();
  });

  it('accepts an integer count', () => {
    expect(validateAt('childcareChildrenCount', 2)).toBe(2);
  });
});
