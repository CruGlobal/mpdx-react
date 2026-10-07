import { getHousingKind } from 'src/components/Reports/Shared/HousingAllowance/housingAllowance';
import { MinistersHousingIneligibilityReasonEnum } from 'src/graphql/types.generated';

export const getIneligibilityReason = (
  t: (key: string) => string,
  eligible: boolean,
  country: string | null,
  reasonCode: MinistersHousingIneligibilityReasonEnum | null,
): string => {
  if (eligible) {
    return t('Completed the required IBS courses');
  }
  const reasonCopy: Record<MinistersHousingIneligibilityReasonEnum, string> = {
    [MinistersHousingIneligibilityReasonEnum.PersonType]: t(
      'Staff type is not eligible for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.SupportType]: t(
      'Support type must be Supported RMO',
    ),
    [MinistersHousingIneligibilityReasonEnum.AssignmentStatus]: t(
      'Assignment status must be payroll eligible',
    ),
    [MinistersHousingIneligibilityReasonEnum.ItalyMhi]: t(
      'Must complete an MHI form instead',
    ),
    // Unreachable in MHA results (the MHA country check only fails for Italy)
    [MinistersHousingIneligibilityReasonEnum.NonItalyMha]: t('Not applicable'),
    [MinistersHousingIneligibilityReasonEnum.NoIbsCertification]: t(
      'Has not completed the required IBS courses',
    ),
    [MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification]: t(
      'IBS certification type is not valid for MHA',
    ),
    [MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired]: t(
      'IBS certification is more than 10 years old',
    ),
    [MinistersHousingIneligibilityReasonEnum.MissingIbsCertificationDate]: t(
      'IBS certification date is missing from your records',
    ),
  };
  // Fall back to the country-based guess when the API predates the reason code
  // (null) or sends a code newer than this client (missing from the record)
  const fallbackCode =
    getHousingKind(country) === 'MHI'
      ? MinistersHousingIneligibilityReasonEnum.ItalyMhi
      : MinistersHousingIneligibilityReasonEnum.NoIbsCertification;
  return reasonCopy[reasonCode ?? fallbackCode] ?? reasonCopy[fallbackCode];
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
  const reasonCopy: Record<MinistersHousingIneligibilityReasonEnum, string> = {
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
  const fallbackCode =
    MinistersHousingIneligibilityReasonEnum.InvalidIbsCertification;
  return reasonCopy[reasonCode ?? fallbackCode] ?? reasonCopy[fallbackCode];
};
