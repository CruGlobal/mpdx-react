import {
  GoalGeographicConstantMap,
  GoalMiscConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { buildPdsGoalConstants } from './pdsGoalConstants';

const makeConstant = (fee: number) => ({
  fee,
  id: '1',
  category: '' as never,
  categoryDisplayName: '',
  label: '' as never,
  labelDisplayName: '',
});

const buildMiscConstants = (
  overrides: Partial<{
    employerFicaRate: number | undefined;
    workComp: number | undefined;
    attritionRate: number | undefined;
    creditCardFeeRate: number | undefined;
    adminRate: number | undefined;
  }> = {},
): GoalMiscConstants => ({
  ADDITIONAL_RATES: {
    ...(overrides.employerFicaRate !== undefined
      ? { EMPLOYER_FICA_RATE: makeConstant(overrides.employerFicaRate) }
      : { EMPLOYER_FICA_RATE: makeConstant(0.08) }),
    ...(overrides.workComp !== undefined
      ? { PART_TIME_WORK_COMPENSATION: makeConstant(overrides.workComp) }
      : { PART_TIME_WORK_COMPENSATION: makeConstant(0.17) }),
    ...(overrides.creditCardFeeRate !== undefined
      ? { CREDIT_CARD_FEE_RATE: makeConstant(overrides.creditCardFeeRate) }
      : { CREDIT_CARD_FEE_RATE: makeConstant(0.06) }),
  },
  RATES: {
    ...(overrides.attritionRate !== undefined
      ? { ATTRITION_RATE: makeConstant(overrides.attritionRate) }
      : { ATTRITION_RATE: makeConstant(0.06) }),
    ...(overrides.adminRate !== undefined
      ? { ADMIN_RATE: makeConstant(overrides.adminRate) }
      : { ADMIN_RATE: makeConstant(0.12) }),
  },
});

const defaultGeoMap: GoalGeographicConstantMap = new Map([
  ['US-CO', 0.06],
  ['US-NY', 0.12],
]);

describe('buildPdsGoalConstants', () => {
  it('returns constants with correct rate values', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      null,
    );

    expect(result).toEqual({
      employerFicaRate: 0.08,
      workCompPercentage: 0.17,
      attritionRate: 0.06,
      creditCardFeeRate: 0.06,
      adminRate: 0.12,
      fourOThreeBPercentage: 0,
      geographicMultiplier: 0.06,
    });
  });

  it('returns null when EMPLOYER_FICA_RATE is missing', () => {
    const misc = buildMiscConstants();
    delete misc.ADDITIONAL_RATES?.EMPLOYER_FICA_RATE;

    const result = buildPdsGoalConstants(misc, defaultGeoMap, 'US-CO', null);
    expect(result).toBeNull();
  });

  it('returns null when PART_TIME_WORK_COMPENSATION is missing', () => {
    const misc = buildMiscConstants();
    delete misc.ADDITIONAL_RATES?.PART_TIME_WORK_COMPENSATION;

    const result = buildPdsGoalConstants(misc, defaultGeoMap, 'US-CO', null);
    expect(result).toBeNull();
  });

  it('returns null when ATTRITION_RATE is missing', () => {
    const misc = buildMiscConstants();
    delete misc.RATES?.ATTRITION_RATE;

    const result = buildPdsGoalConstants(misc, defaultGeoMap, 'US-CO', null);
    expect(result).toBeNull();
  });

  it('returns null when CREDIT_CARD_FEE_RATE is missing', () => {
    const misc = buildMiscConstants();
    delete misc.ADDITIONAL_RATES?.CREDIT_CARD_FEE_RATE;

    const result = buildPdsGoalConstants(misc, defaultGeoMap, 'US-CO', null);
    expect(result).toBeNull();
  });

  it('returns null when ADMIN_RATE is missing', () => {
    const misc = buildMiscConstants();
    delete misc.RATES?.ADMIN_RATE;

    const result = buildPdsGoalConstants(misc, defaultGeoMap, 'US-CO', null);
    expect(result).toBeNull();
  });

  it('returns geographicMultiplier of 0 for unknown location', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-XX',
      null,
    );

    expect(result?.geographicMultiplier).toBe(0);
  });

  it('returns geographicMultiplier of 0 when location is null', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      null,
      null,
    );

    expect(result?.geographicMultiplier).toBe(0);
  });

  it('returns geographicMultiplier of 0 when location is undefined', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      undefined,
      null,
    );

    expect(result?.geographicMultiplier).toBe(0);
  });

  it('looks up correct geographic multiplier', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-NY',
      null,
    );

    expect(result?.geographicMultiplier).toBe(0.12);
  });

  it('divides 403b percentages by 100 and sums them', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      {
        currentTaxDeferredContributionPercentage: 5,
        currentRothContributionPercentage: 3,
      },
    );

    expect(result?.fourOThreeBPercentage).toBeCloseTo(0.08);
  });

  it('treats null 403b percentages as 0', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      {
        currentTaxDeferredContributionPercentage: null,
        currentRothContributionPercentage: null,
      },
    );

    expect(result?.fourOThreeBPercentage).toBe(0);
  });

  it('treats undefined 403b fields as 0', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      {
        currentTaxDeferredContributionPercentage: undefined,
        currentRothContributionPercentage: undefined,
      },
    );

    expect(result?.fourOThreeBPercentage).toBe(0);
  });

  it('handles null fourOThreeB object', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      null,
    );

    expect(result?.fourOThreeBPercentage).toBe(0);
  });

  it('handles undefined fourOThreeB object', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      undefined,
    );

    expect(result?.fourOThreeBPercentage).toBe(0);
  });

  it('handles only taxDeferred percentage set', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      {
        currentTaxDeferredContributionPercentage: 10,
        currentRothContributionPercentage: null,
      },
    );

    expect(result?.fourOThreeBPercentage).toBeCloseTo(0.1);
  });

  it('handles only Roth percentage set', () => {
    const result = buildPdsGoalConstants(
      buildMiscConstants(),
      defaultGeoMap,
      'US-CO',
      {
        currentTaxDeferredContributionPercentage: null,
        currentRothContributionPercentage: 7,
      },
    );

    expect(result?.fourOThreeBPercentage).toBeCloseTo(0.07);
  });
});
