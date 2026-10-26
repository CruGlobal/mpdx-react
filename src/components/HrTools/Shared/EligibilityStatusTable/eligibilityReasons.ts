import { getHousingKind } from 'src/components/Reports/Shared/HousingAllowance/housingAllowance';
import { MinistersHousingIneligibilityReasonEnum } from 'src/graphql/types.generated';

// Partial on purpose: the API enum is still growing, so a code newer than this
// client must degrade to the fallback copy at runtime instead of failing the
// build (see .claude/review/rules/data-integrity.md).
type ReasonCopy = Partial<
  Record<MinistersHousingIneligibilityReasonEnum, string>
>;

// What MHA eligibility rests on: the MHA Request form checks the IBS
// certification (mhaEit), the Salary Calculator checks the Board approval date
// (mhaSalaryEit).
export type EligibilityBasis = 'ibs' | 'boardApproval';

export const getIneligibilityReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
  reasonCode: MinistersHousingIneligibilityReasonEnum | null,
  basis: EligibilityBasis = 'ibs',
): string => {
  if (eligible) {
    return basis === 'boardApproval'
      ? t('MHA was Board approved within the last 10 years')
      : t('Completed the required IBS courses');
  }
  const mustUseMhiForm = t('Must complete an MHI form instead');
  const noIbsCourses = t('Has not completed the required IBS courses');
  const notBasisMet =
    basis === 'boardApproval'
      ? t('No current MHA Board approval')
      : noIbsCourses;
  const reasonCopy: ReasonCopy = {
    [MinistersHousingIneligibilityReasonEnum.PersonType]: t(
      'Staff type is not eligible for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.SupportType]: t(
      'Support type must be Supported RMO',
    ),
    [MinistersHousingIneligibilityReasonEnum.AssignmentStatus]: t(
      'Assignment status must be payroll eligible',
    ),
    [MinistersHousingIneligibilityReasonEnum.ItalyMhi]: mustUseMhiForm,
    // Unreachable in MHA results (the MHA country check only fails for Italy)
    [MinistersHousingIneligibilityReasonEnum.NonItalyMha]: t('Not applicable'),
    [MinistersHousingIneligibilityReasonEnum.NoIbsCertification]: noIbsCourses,
    [MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification]: t(
      'IBS certification type is not valid for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired]: t(
      'IBS certification is more than 10 years old',
    ),
    [MinistersHousingIneligibilityReasonEnum.MissingIbsCertificationDate]: t(
      'IBS certification date is missing from your records',
    ),
    [MinistersHousingIneligibilityReasonEnum.BoardApprovalExpired]: t(
      'Board approval is more than 10 years old',
    ),
    [MinistersHousingIneligibilityReasonEnum.MissingBoardApprovedOnDate]: t(
      'Board approval date is missing from your records',
    ),
  };
  // Fall back to the country-based guess when the API predates the reason code
  // (null) or sends a code this client does not know yet
  const fallbackCopy =
    getHousingKind(country) === 'MHI' ? mustUseMhiForm : notBasisMet;
  const copy = reasonCode ? reasonCopy[reasonCode] : undefined;
  return copy ?? fallbackCopy;
};

export const getMhiReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
  reasonCode: MinistersHousingIneligibilityReasonEnum | null,
): string => {
  if (getHousingKind(country) !== 'MHI') {
    return t('Not applicable');
  }
  if (eligible) {
    return t('Satisfies the IBS Exception for Italy staff');
  }
  const exceptionNotSatisfied = t(
    'Does not satisfy the IBS Exception for Italy staff',
  );
  const reasonCopy: ReasonCopy = {
    [MinistersHousingIneligibilityReasonEnum.PersonType]: t(
      'Staff type is not eligible for MHI',
    ),
    [MinistersHousingIneligibilityReasonEnum.SupportType]: t(
      'Support type must be Supported RMO',
    ),
    [MinistersHousingIneligibilityReasonEnum.AssignmentStatus]: t(
      'Assignment status must be payroll eligible',
    ),
    // Every certification-family failure means the Italy exception is not met
    [MinistersHousingIneligibilityReasonEnum.NoIbsCertification]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired]:
      exceptionNotSatisfied,
    [MinistersHousingIneligibilityReasonEnum.MissingIbsCertificationDate]:
      exceptionNotSatisfied,
    // Unreachable in MHI results: Italy staff pass the MHI country check
    [MinistersHousingIneligibilityReasonEnum.ItalyMhi]: exceptionNotSatisfied,
    // Unreachable here: the country gate above already returned Not applicable
    [MinistersHousingIneligibilityReasonEnum.NonItalyMha]: t('Not applicable'),
  };
  // A null or unknown code still means the exception was not met
  const copy = reasonCode ? reasonCopy[reasonCode] : undefined;
  return copy ?? exceptionNotSatisfied;
};
