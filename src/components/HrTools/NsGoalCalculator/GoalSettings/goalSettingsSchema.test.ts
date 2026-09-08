import * as yup from 'yup';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { getGoalSettingsSchema } from './goalSettingsSchema';

const { Married } = NewStaffQuestionnaireMaritalStatusEnum;

const schema = getGoalSettingsSchema(i18n.t);

const emptyGoalSettingsValues = {
  annualRequestedSalary: '',
  contribution403bPercentage: '',
  childcareChildrenCount: '',
  tenure: '',
  reimbursableExpenses: '',
};

const marriedGoalSettingsValues = {
  ...emptyGoalSettingsValues,
  maritalStatus: Married,
  spouseTenure: '',
};

const validateAt = (field: string, value: unknown) =>
  schema.validateSyncAt(field, {
    ...emptyGoalSettingsValues,
    [field]: value,
  });

/** All messages from validating the object, sorted alphabetically. */
const validationErrors = async (values: object): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return (error as yup.ValidationError).errors.sort();
  }
};

describe('getGoalSettingsSchema', () => {
  // The blank defaults are missing every field a goal cannot be calculated
  // without, which is what makes Save & Share name them.
  it('rejects the blank defaults for exactly the required fields', async () => {
    expect(await validationErrors(emptyGoalSettingsValues)).toEqual([
      'Age is required',
      'Benefits Plan is required',
      'Calculation Year is required',
      'Field or Office Based is required',
      'Full Time Years on Staff is required',
      'Marital Status is required',
    ]);
  });

  it('names the spouse fields distinguishably when married', async () => {
    expect(await validationErrors(marriedGoalSettingsValues)).toEqual([
      'Age is required',
      'Benefits Plan is required',
      'Calculation Year is required',
      'Field or Office Based is required',
      'Full Time Years on Staff is required',
      'Spouse Age is required',
      'Spouse Full Time Years on Staff is required',
    ]);
  });

  // 0 is the normal tenure for new staff, so only "not set" may be rejected.
  it('accepts zero years on staff', () => {
    expect(validateAt('tenure', 0)).toBe(0);
  });

  it('accepts zero years on staff for the spouse', () => {
    expect(
      schema.validateSyncAt('spouseTenure', {
        ...marriedGoalSettingsValues,
        spouseTenure: 0,
      }),
    ).toBe(0);
  });

  it('rejects a blank years on staff', () => {
    expect(() => validateAt('tenure', '')).toThrow(
      'Full Time Years on Staff is required',
    );
  });

  it('leaves the optional numeric fields alone when blank', () => {
    expect(validateAt('reimbursableExpenses', '')).toBeNull();
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
