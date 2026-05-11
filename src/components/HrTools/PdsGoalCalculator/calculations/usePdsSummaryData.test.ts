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
import {
  PdsGoalTotalConstants,
  calculatePdsGoalTotal,
} from './calculatePdsGoalTotal';
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
      expect(result.current).toBeNull();
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
      expect(result.current).toBeNull();
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
      expect(result.current?.geographicMultiplier).toBe(GEO_MULTIPLIER);
    });

    it('defaults to 0 when geographicLocation is null', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      expect(result.current?.geographicMultiplier).toBe(0);
    });

    it('defaults to 0 when geographicLocation is not in the map', () => {
      const calc = {
        ...defaultCalculation,
        geographicLocation: 'Unknown City',
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current?.geographicMultiplier).toBe(0);
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
      expect(result.current?.salaryConstants).toEqual({
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
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBeCloseTo(
        0.08,
      );
    });

    it('defaults to 0 when hcmUser is undefined', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, undefined),
      );
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBe(0);
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
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBe(0);
    });
  });

  describe('overall total', () => {
    it('sums subtotal + attrition + creditCardFees + assessment', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      const data = result.current!;
      const expected =
        data.otherTotals.subtotal +
        data.otherTotals.attrition +
        data.otherTotals.creditCardFees +
        data.otherTotals.assessment;
      expect(data.overallTotal).toBeCloseTo(expected);
    });

    it('computes correct overallTotal for a full-time salaried employee', () => {
      // No geographic multiplier, payRate = 60000
      // grossMonthlyPay = 60000 / 12 = 5000
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
      // creditCardFees = (7800 + 468) * 0.06 = 496.08
      // assessment = (7800 + 468 + 496.08) * 0.12 = 1051.69
      // overallTotal = 7800 + 468 + 496.08 + 1051.69 = 9815.77
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      expect(result.current?.overallTotal).toBeCloseTo(9815.77, 0);
    });
  });

  describe('result shape', () => {
    it('returns all expected fields', () => {
      const { result } = renderHook(() =>
        usePdsSummaryData(defaultCalculation, defaultHcmUser),
      );
      const data = result.current!;
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
      expect(result.current?.otherConstants.reimbursableTotal).toBe(0);
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBe(0);
      // The reimbursableTotals object is still computed (data isn't lost),
      // but the otherConstants.reimbursableTotal that feeds the Other Expenses
      // calculation is zeroed.
      expect(result.current?.reimbursableTotals.total).toBeGreaterThan(0);
    });

    it('uses saved reimbursable + 403b values when formType is Detailed', () => {
      const calc = {
        ...defaultCalculation,
        formType: DesignationSupportFormType.Detailed,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current?.otherConstants.reimbursableTotal).toBeGreaterThan(
        0,
      );
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBeCloseTo(
        0.08,
      );
    });

    it('uses saved values when formType is null/undefined (legacy goals default to Detailed behavior)', () => {
      const calc = {
        ...defaultCalculation,
        formType: null,
      };
      const { result } = renderHook(() =>
        usePdsSummaryData(calc, defaultHcmUser),
      );
      expect(result.current?.otherConstants.reimbursableTotal).toBeGreaterThan(
        0,
      );
      expect(result.current?.otherConstants.fourOThreeBPercentage).toBeCloseTo(
        0.08,
      );
    });
  });

  describe('consistency with calculatePdsGoalTotal', () => {
    // Mirrors what buildPdsGoalConstants would derive from the mocked
    // useGoalCalculatorConstants + defaultHcmUser, so we can call
    // calculatePdsGoalTotal directly without the hook.
    const directConstants: PdsGoalTotalConstants = {
      employerFicaRate: EMPLOYER_FICA_RATE,
      workCompPercentage: WORK_COMP_PERCENTAGE,
      attritionRate: ATTRITION_RATE,
      creditCardFeeRate: CREDIT_CARD_FEE_RATE,
      adminRate: ADMIN_RATE,
      fourOThreeBPercentage: 0.08,
      geographicMultiplier: 0,
    };

    it.each([
      DesignationSupportFormType.Detailed,
      DesignationSupportFormType.Simple,
    ])(
      'calculatePdsGoalTotal matches usePdsSummaryData.otherTotals.assessment when formType is %s',
      (formType) => {
        const calc = { ...defaultCalculation, formType };
        const { result } = renderHook(() =>
          usePdsSummaryData(calc, defaultHcmUser),
        );
        const direct = calculatePdsGoalTotal(calc, directConstants);
        expect(direct).toBeCloseTo(result.current!.otherTotals.assessment, 5);
      },
    );
  });
});
