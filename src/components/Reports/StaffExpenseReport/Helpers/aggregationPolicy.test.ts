import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import {
  AggregationPeriod,
  ITEMIZED_ROW_RANK,
  getAggregationPolicy,
  getBucketLabel,
  getRollupRank,
} from './aggregationPolicy';

describe('aggregationPolicy', () => {
  it('itemizes account transfers', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.AccountTransfer),
    ).toEqual({ period: AggregationPeriod.None });
    expect(
      getAggregationPolicy(
        StaffExpensesSubCategoryEnum.AccountTransferInternalGift,
      ),
    ).toEqual({ period: AggregationPeriod.None });
  });

  it('itemizes transfers, withdrawals, and deposits', () => {
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.Transfer)).toEqual(
      {
        period: AggregationPeriod.None,
      },
    );
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.Withdrawal),
    ).toEqual({ period: AggregationPeriod.None });
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.Deposit)).toEqual({
      period: AggregationPeriod.None,
    });
  });

  it('rounds donations monthly but itemizes internal gifts and non cash', () => {
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.Donation)).toEqual(
      {
        period: AggregationPeriod.Month,
      },
    );
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.DonationInternalGift),
    ).toEqual({ period: AggregationPeriod.None });
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.NonCash)).toEqual({
      period: AggregationPeriod.None,
    });
  });

  it('rounds other assessment and staff assessment into one shared monthly bucket', () => {
    const otherAssessment = getAggregationPolicy(
      StaffExpensesSubCategoryEnum.OtherAssessment,
    );
    const staffAssessment = getAggregationPolicy(
      StaffExpensesSubCategoryEnum.StaffAssessment,
    );

    expect(otherAssessment).toEqual({
      period: AggregationPeriod.Month,
      bucket: StaffExpenseCategoryEnum.Assessment,
    });
    expect(staffAssessment).toEqual(otherAssessment);
  });

  it('keeps credit card fees in their own monthly bucket', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.CreditCardFee),
    ).toEqual({ period: AggregationPeriod.Month });
  });

  it('rounds additional salary, healthcare reimbursement, and the healthcare debit card monthly', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.AdditionalSalary),
    ).toEqual({ period: AggregationPeriod.Month });
    expect(
      getAggregationPolicy(
        StaffExpensesSubCategoryEnum.HealthcareReimbursement,
      ),
    ).toEqual({ period: AggregationPeriod.Month });
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.PaCard)).toEqual({
      period: AggregationPeriod.Month,
    });
  });

  it('collapses every benefits subcategory into one date bucket', () => {
    const benefits = [
      StaffExpensesSubCategoryEnum.DisabilityInsurance,
      StaffExpensesSubCategoryEnum.HealthWelfare,
      StaffExpensesSubCategoryEnum.ImputedIncome,
      StaffExpensesSubCategoryEnum.LeaveInsurance,
      StaffExpensesSubCategoryEnum.LifeInsurance,
      StaffExpensesSubCategoryEnum.MedicalDeduction,
      StaffExpensesSubCategoryEnum.MinistryBenefits,
      StaffExpensesSubCategoryEnum.NumericDeduction,
      StaffExpensesSubCategoryEnum.OtherErCharges,
      StaffExpensesSubCategoryEnum.PayrollTaxes,
      StaffExpensesSubCategoryEnum.ProgramBased,
      StaffExpensesSubCategoryEnum.RetirementContributions,
      StaffExpensesSubCategoryEnum.WorkersCompensation,
    ];

    expect(benefits).toHaveLength(13);
    benefits.forEach((subCategory) => {
      expect(getAggregationPolicy(subCategory)).toEqual({
        period: AggregationPeriod.Day,
        bucket: StaffExpenseCategoryEnum.Benefits,
      });
    });
  });

  it('collapses salary subcategories into one date bucket per person', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.RegularPay),
    ).toEqual({
      period: AggregationPeriod.Day,
      bucket: StaffExpenseCategoryEnum.Salary,
      perPerson: true,
    });
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.TaxFederal),
    ).toEqual({
      period: AggregationPeriod.Day,
      bucket: StaffExpenseCategoryEnum.Salary,
      perPerson: true,
    });
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.HousingAllowances),
    ).toEqual({
      period: AggregationPeriod.Day,
      bucket: StaffExpenseCategoryEnum.Salary,
      perPerson: true,
    });
  });

  it('keeps a household together outside salary, which alone splits per person', () => {
    // The Sheet provided by the finance team asks for "per paycheck per person" under salary only. Benefits read "subtotal all
    // benefits by paycheck date", with no person clause.
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.PayrollTaxes).perPerson,
    ).toBeUndefined();
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.Donation).perPerson,
    ).toBeUndefined();
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.AdditionalSalary)
        .perPerson,
    ).toBeUndefined();
  });

  it('itemizes bonuses rather than folding them into the salary bucket', () => {
    expect(getAggregationPolicy(StaffExpensesSubCategoryEnum.Bonuses)).toEqual({
      period: AggregationPeriod.None,
    });
  });

  it('itemizes staffcard, which the sheet left unresolved', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.Staffcard),
    ).toEqual({ period: AggregationPeriod.None });
  });

  it('rounds ministry reimbursement monthly as the nearest thing to by expense report', () => {
    expect(
      getAggregationPolicy(StaffExpensesSubCategoryEnum.MinistryReimbursement),
    ).toEqual({ period: AggregationPeriod.Month });
  });

  it('assigns a policy to every subcategory the schema defines', () => {
    const subCategories = Object.values(StaffExpensesSubCategoryEnum);

    expect(subCategories).toHaveLength(70);
    subCategories.forEach((subCategory) => {
      expect(getAggregationPolicy(subCategory).period).toEqual(
        expect.any(String),
      );
    });
  });

  it('itemizes a transaction with no subcategory', () => {
    expect(getAggregationPolicy(undefined)).toEqual({
      period: AggregationPeriod.None,
    });
  });

  it('itemizes an unrecognized subcategory rather than throwing', () => {
    expect(
      getAggregationPolicy(
        'BRAND_NEW_SUBCATEGORY' as StaffExpensesSubCategoryEnum,
      ),
    ).toEqual({ period: AggregationPeriod.None });
  });

  it('labels a shared assessment bucket', () => {
    const policy = getAggregationPolicy(
      StaffExpensesSubCategoryEnum.StaffAssessment,
    );

    expect(
      getBucketLabel(
        policy,
        StaffExpenseCategoryEnum.Assessment,
        StaffExpensesSubCategoryEnum.StaffAssessment,
        i18n.t,
      ),
    ).toBe('Assessments');
  });

  it('labels salary and benefits buckets with the category name', () => {
    expect(
      getBucketLabel(
        getAggregationPolicy(StaffExpensesSubCategoryEnum.RegularPay),
        StaffExpenseCategoryEnum.Salary,
        StaffExpensesSubCategoryEnum.RegularPay,
        i18n.t,
      ),
    ).toBe('Salary');
    expect(
      getBucketLabel(
        getAggregationPolicy(StaffExpensesSubCategoryEnum.PayrollTaxes),
        StaffExpenseCategoryEnum.Benefits,
        StaffExpensesSubCategoryEnum.PayrollTaxes,
        i18n.t,
      ),
    ).toBe('Benefits');
  });

  it('labels a monthly subcategory bucket with its plural', () => {
    expect(
      getBucketLabel(
        getAggregationPolicy(StaffExpensesSubCategoryEnum.Donation),
        StaffExpenseCategoryEnum.Donation,
        StaffExpensesSubCategoryEnum.Donation,
        i18n.t,
      ),
    ).toBe('Donations');
  });

  it('ranks the rows staff read first ahead of the other rollups', () => {
    const ranks = [
      StaffExpensesSubCategoryEnum.Donation,
      StaffExpenseCategoryEnum.Assessment,
      StaffExpensesSubCategoryEnum.CreditCardFee,
      StaffExpenseCategoryEnum.Benefits,
    ].map(getRollupRank);

    expect(ranks).toEqual([0, 1, 2, 3]);
    expect(getRollupRank(StaffExpenseCategoryEnum.Salary)).toBeGreaterThan(3);
    expect(
      getRollupRank(StaffExpensesSubCategoryEnum.MinistryReimbursement),
    ).toBeGreaterThan(getRollupRank(StaffExpenseCategoryEnum.Salary));
  });

  it('ranks a bucket the order does not name ahead of the itemized rows', () => {
    const unnamed = getRollupRank(
      'BRAND_NEW_BUCKET' as StaffExpenseCategoryEnum,
    );

    expect(unnamed).toBeGreaterThan(
      getRollupRank(StaffExpensesSubCategoryEnum.MinistryReimbursement),
    );
    expect(unnamed).toBeLessThan(ITEMIZED_ROW_RANK);
  });

  it('labels the healthcare debit card bucket with its renamed label', () => {
    expect(
      getBucketLabel(
        getAggregationPolicy(StaffExpensesSubCategoryEnum.PaCard),
        StaffExpenseCategoryEnum.StaffExpense,
        StaffExpensesSubCategoryEnum.PaCard,
        i18n.t,
      ),
    ).toBe('Healthcare Debit Card');
  });
});
