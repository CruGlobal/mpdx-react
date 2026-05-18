import { renderHook } from '@testing-library/react-hooks';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsDocument,
  GoalCalculatorConstantsQuery,
} from 'src/hooks/goalCalculatorConstants.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  PdsGoalCalculationFieldsFragment,
  PdsGoalCalculationFieldsFragmentDoc,
} from '../GoalsList/PdsGoalCalculations.generated';
import { HcmUserDocument, HcmUserQuery } from '../Shared/HCM.generated';
import { usePdsSummaryData } from './usePdsSummaryData';

jest.mock('src/hooks/useGoalCalculatorConstants');

const { formatConstants } = jest.requireActual<
  typeof import('src/hooks/useGoalCalculatorConstants')
>('src/hooks/useGoalCalculatorConstants');

const mockUseGoalCalculatorConstants =
  useGoalCalculatorConstants as jest.MockedFunction<
    typeof useGoalCalculatorConstants
  >;

const EMPLOYER_FICA_RATE = 0.08;
const WORK_COMP_PERCENTAGE = 0.17;
const ATTRITION_RATE = 0.06;
const CREDIT_CARD_FEE_RATE = 0.06;
const ADMIN_RATE = 0.12;
const GEO_MULTIPLIER = 0.06;

const constantsMock = gqlMock<GoalCalculatorConstantsQuery>(
  GoalCalculatorConstantsDocument,
  {
    mocks: {
      constant: {
        mpdGoalMiscConstants: [
          {
            category: MpdGoalMiscConstantCategoryEnum.AdditionalRates,
            label: MpdGoalMiscConstantLabelEnum.EmployerFicaRate,
            fee: EMPLOYER_FICA_RATE,
          },
          {
            category: MpdGoalMiscConstantCategoryEnum.AdditionalRates,
            label: MpdGoalMiscConstantLabelEnum.PartTimeWorkCompensation,
            fee: WORK_COMP_PERCENTAGE,
          },
          {
            category: MpdGoalMiscConstantCategoryEnum.AdditionalRates,
            label: MpdGoalMiscConstantLabelEnum.CreditCardFeeRate,
            fee: CREDIT_CARD_FEE_RATE,
          },
          {
            category: MpdGoalMiscConstantCategoryEnum.Rates,
            label: MpdGoalMiscConstantLabelEnum.AttritionRate,
            fee: ATTRITION_RATE,
          },
          {
            category: MpdGoalMiscConstantCategoryEnum.Rates,
            label: MpdGoalMiscConstantLabelEnum.AdminRate,
            fee: ADMIN_RATE,
          },
        ],
        mpdGoalGeographicConstants: [
          { location: 'Orlando, FL', percentageMultiplier: GEO_MULTIPLIER },
          { location: 'None', percentageMultiplier: 0 },
        ],
        mpdGoalBenefitsConstants: [],
      },
    },
  },
).constant;

const defaultConstants = formatConstants(constantsMock);

const setupMock = (
  overrides?: Partial<ReturnType<typeof useGoalCalculatorConstants>>,
) => {
  mockUseGoalCalculatorConstants.mockReturnValue({
    ...defaultConstants,
    loading: false,
    error: undefined,
    ...overrides,
  });
};

const defaultCalculation = gqlMock<PdsGoalCalculationFieldsFragment>(
  PdsGoalCalculationFieldsFragmentDoc,
  {
    mocks: {
      salaryOrHourly: DesignationSupportSalaryType.Salaried,
      status: DesignationSupportStatus.FullTime,
      formType: DesignationSupportFormType.Detailed,
      payRate: 60000,
      benefits: 1500,
      ministryCellPhone: 100,
      ministryInternet: 100,
      mpdNewsletter: 50,
      mpdMiscellaneous: 50,
      accountTransfers: 50,
      otherMonthlyReimbursements: 50,
      conferenceRetreatCosts: 600,
      ministryTravelMeals: 600,
      otherAnnualReimbursements: 0,
    },
  },
);

const defaultHcmUser = gqlMock<HcmUserQuery>(HcmUserDocument, {
  mocks: {
    hcm: [
      {
        fourOThreeB: {
          currentTaxDeferredContributionPercentage: 5,
          currentRothContributionPercentage: 3,
        },
      },
    ],
  },
}).hcm[0];

describe('usePdsSummaryData', () => {
  beforeEach(() => {
    setupMock();
  });

  describe('null guards', () => {
    it('returns null when calculation is undefined', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(undefined, defaultHcmUser),
      );
      expect(result.current.data).toBeNull();
    });

    it.each([
      [
        'employerFicaRate',
        {
          ADDITIONAL_RATES: {
            ...defaultConstants.goalMiscConstants.ADDITIONAL_RATES,
            EMPLOYER_FICA_RATE: undefined,
          },
        },
      ],
      [
        'workCompPercentage',
        {
          ADDITIONAL_RATES: {
            ...defaultConstants.goalMiscConstants.ADDITIONAL_RATES,
            PART_TIME_WORK_COMPENSATION: undefined,
          },
        },
      ],
      [
        'creditCardFeeRate',
        {
          ADDITIONAL_RATES: {
            ...defaultConstants.goalMiscConstants.ADDITIONAL_RATES,
            CREDIT_CARD_FEE_RATE: undefined,
          },
        },
      ],
      [
        'attritionRate',
        {
          RATES: {
            ...defaultConstants.goalMiscConstants.RATES,
            ATTRITION_RATE: undefined,
          },
        },
      ],
      [
        'adminRate',
        {
          RATES: {
            ...defaultConstants.goalMiscConstants.RATES,
            ADMIN_RATE: undefined,
          },
        },
      ],
    ])('returns null when %s is missing', (_label, override) => {
      setupMock({
        goalMiscConstants: {
          ...defaultConstants.goalMiscConstants,
          ...override,
        },
      });
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      expect(result.current.data).toBeNull();
    });
  });

  describe('geographic multiplier', () => {
    it('looks up the multiplier from the geographic constant map', () => {
      const calc = {
        ...defaultCalculation,
        geographicLocation: 'Orlando, FL',
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current.data?.geographicMultiplier).toBe(GEO_MULTIPLIER);
    });

    it('defaults to 0 (no adjustment) when geographicLocation is null', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      expect(result.current.data?.geographicMultiplier).toBe(0);
    });

    it('defaults to 0 (no adjustment) when geographicLocation is not in the map', () => {
      const calc = {
        ...defaultCalculation,
        geographicLocation: 'Unknown City',
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current.data?.geographicMultiplier).toBe(0);
    });
  });

  describe('salary constants passthrough', () => {
    it('passes geographicMultiplier and employerFicaRate to salaryConstants', () => {
      const calc = {
        ...defaultCalculation,
        geographicLocation: 'Orlando, FL',
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current.data?.salaryConstants).toEqual({
        geographicMultiplier: GEO_MULTIPLIER,
        employerFicaRate: EMPLOYER_FICA_RATE,
      });
    });
  });

  describe('403b percentage extraction', () => {
    it('combines taxDeferred and roth percentages divided by 100', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      // (5 + 3) / 100 = 0.08
      expect(
        result.current.data?.otherConstants.fourOThreeBPercentage,
      ).toBeCloseTo(0.08);
    });

    it('defaults to 0 when hcmUser is undefined', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, undefined),
      );
      expect(result.current.data?.otherConstants.fourOThreeBPercentage).toBe(0);
    });

    it('defaults to 0 when contribution percentages are null', () => {
      const hcmUser: HcmUserQuery['hcm'][number] = {
        ...defaultHcmUser,
        fourOThreeB: {
          ...defaultHcmUser.fourOThreeB,
          currentTaxDeferredContributionPercentage: null,
          currentRothContributionPercentage: null,
        },
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, hcmUser),
      );
      expect(result.current.data?.otherConstants.fourOThreeBPercentage).toBe(0);
    });
  });

  describe('overall total', () => {
    it('sums subtotal + attrition + creditCardFees + assessment', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      const data = result.current.data!;
      const expected =
        data.otherTotals.subtotal +
        data.otherTotals.attrition +
        data.otherTotals.creditCardFees +
        data.otherTotals.assessment;
      expect(data.overallTotal).toBeCloseTo(expected);
    });

    it('computes correct overallTotal for a full-time salaried employee', () => {
      // Geographic multiplier defaults to 0 (no adjustment), payRate = 60000
      // grossMonthlyPay = 60000 / 12 * (1 + 0) = 5000
      // employerFica = 5000 * 0.08 = 400
      // salarySubtotal = 5400
      //
      // Reimbursable: monthly = 100+100+50+50+50+50 = 400, annual = 600+600+0 = 1200
      // raw = 400 + 1200/12 = 500, above floor so total = 500
      //
      // 403b: (5+3)/100 = 0.08, contributions = 5000 * 0.08 = 400
      // benefits = 1500 (full-time)
      // workComp = 0 (full-time)
      // otherSubtotal = 5400 + 500 + 400 + 0 + 1500 = 7800
      // attrition = 7800 * 0.06 = 468
      // creditCardFees = (7800 + 468) / (1 - 0.06) - (7800 + 468) ≈ 527.74
      // adminBase = 7800 + 468 + 527.74 ≈ 8795.74
      // assessment = adminBase / 0.88 - adminBase ≈ 1199.42
      // overallTotal = 7800 + 468 + 527.74 + 1199.42 ≈ 9995.16
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      expect(result.current.data?.overallTotal).toBeCloseTo(9995.16, 0);
    });

    it('computes correct overallTotal for a part-time hourly employee', () => {
      // No geographic multiplier (defaults to 0), payRate = 25, hours = 20
      // monthlyBase = (25 * 20 * 52) / 12 = 2166.667
      // grossMonthlyPay = 2166.667 (no geo)
      // employerFica = 2166.667 * 0.08 = 173.333
      // salarySubtotal = 2340
      //
      // Reimbursable: monthly = 400, annual = 1200, raw = 500, above floor
      //
      // 403b = 2166.667 * 0.08 = 173.333
      // workComp = 2166.667 * 0.17 = 368.333 (part-time)
      // benefits = 0 (part-time, ignores calculation.benefits)
      // subtotal = 2340 + 500 + 173.333 + 368.333 + 0 = 3381.667
      // attrition = 3381.667 * 0.06 = 202.9
      // creditCardFees = (3381.667 + 202.9) / (1 - 0.06) - (3381.667 + 202.9) ≈ 228.80
      // adminBase ≈ 3813.37
      // assessment = adminBase / (1 - 0.12) - adminBase ≈ 520.00
      // overallTotal ≈ 3381.667 + 202.9 + 228.80 + 520.00 ≈ 4333.37
      const calc = {
        ...defaultCalculation,
        salaryOrHourly: DesignationSupportSalaryType.Hourly,
        status: DesignationSupportStatus.PartTime,
        payRate: 25,
        hoursWorkedPerWeek: 20,
        benefits: null,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current.data?.overallTotal).toBeCloseTo(4333.37, 0);
      expect(result.current.data?.otherTotals.workComp).toBeCloseTo(368.33, 2);
      expect(result.current.data?.otherTotals.benefits).toBe(0);
    });

    it('does not NaN-cascade when payRate is null', () => {
      // Guards against a regression where a null payRate would propagate
      // through the gross-up formulas (x / (1 - rate)) and produce NaN.
      const calc = {
        ...defaultCalculation,
        payRate: null,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      const data = result.current.data!;
      expect(data.salaryTotals.grossMonthlyPay).toBe(0);
      expect(Number.isFinite(data.otherTotals.creditCardFees)).toBe(true);
      expect(Number.isFinite(data.otherTotals.assessment)).toBe(true);
      expect(Number.isFinite(data.overallTotal)).toBe(true);
    });

    it('applies the geographic multiplier to the overall total', () => {
      const { result: baseline } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      const { result: withGeo } = renderHook(() =>
        usePdsSummaryData(
          { ...defaultCalculation, geographicLocation: 'Orlando, FL' },
          defaultHcmUser,
        ),
      );
      expect(baseline.current.data?.geographicMultiplier).toBe(0);
      expect(withGeo.current.data?.geographicMultiplier).toBe(GEO_MULTIPLIER);
      expect(withGeo.current.data!.overallTotal).toBeGreaterThan(
        baseline.current.data!.overallTotal,
      );
    });
  });

  describe('result shape', () => {
    it('returns all expected fields', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      const data = result.current.data!;
      expect(data).toHaveProperty('salaryTotals');
      expect(data).toHaveProperty('salaryConstants');
      expect(data).toHaveProperty('reimbursableTotals');
      expect(data).toHaveProperty('otherTotals');
      expect(data).toHaveProperty('otherConstants');
      expect(data).toHaveProperty('overallTotal');
      expect(data).toHaveProperty('geographicMultiplier');
    });
  });

  describe('Simple form type', () => {
    it('zeroes reimbursable + 403b but preserves reimbursableTotals', () => {
      const calc = {
        ...defaultCalculation,
        formType: DesignationSupportFormType.Simple,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current.data?.otherConstants.reimbursableTotal).toBe(0);
      expect(result.current.data?.otherConstants.fourOThreeBPercentage).toBe(0);
      // The reimbursableTotals object is still computed (data isn't lost),
      // but the otherConstants.reimbursableTotal that feeds the Other Expenses
      // calculation is zeroed.
      expect(result.current.data?.reimbursableTotals.total).toBeGreaterThan(0);
    });

    it('uses saved reimbursable + 403b values when formType is Detailed', () => {
      const calc = {
        ...defaultCalculation,
        formType: DesignationSupportFormType.Detailed,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(
        result.current.data?.otherConstants.reimbursableTotal,
      ).toBeGreaterThan(0);
      expect(
        result.current.data?.otherConstants.fourOThreeBPercentage,
      ).toBeCloseTo(0.08);
    });

    it('uses saved values when formType is null/undefined (legacy goals default to Detailed behavior)', () => {
      const calc = {
        ...defaultCalculation,
        formType: null,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(
        result.current.data?.otherConstants.reimbursableTotal,
      ).toBeGreaterThan(0);
      expect(
        result.current.data?.otherConstants.fourOThreeBPercentage,
      ).toBeCloseTo(0.08);
    });
  });
});
