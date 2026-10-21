import { TFunction } from 'react-i18next';
import { SecaStatusEnum } from 'src/graphql/types.generated';

export interface SecaNotePerson {
  /** HCM's SECA status for the person. Null when HCM has none on file. */
  secaStatus: SecaStatusEnum | null | undefined;
  /** The person's preferred name, interpolated into the note */
  name: string | null | undefined;
  /** The SECA amount the API calculated for the person's requested salary */
  requestedSeca: number | null | undefined;
}

/** Amounts under half a cent format as $0.00, so they count as no SECA */
const includesSeca = (requestedSeca: number | null | undefined): boolean =>
  Math.abs(requestedSeca ?? 0) >= 0.005;

/**
 * Compile-time guard: adding a SecaStatusEnum member is a type error until the
 * switch in getSecaNote handles it. At runtime an unknown status is a code
 * gap, not an HCM gap, so the note stays silent rather than sending staff to
 * HR.
 */
const unknownSecaStatus = (_status: never): null => null;

/**
 * Explains why a person's SECA line is zero, or returns null when no note
 * applies.
 *
 * HCM's SECA status drives the note, not the estimated SECA amount: the
 * estimate is also zero when HCM has no status on file or the year's salary
 * table is missing, and neither of those means the person opted out.
 *
 * The status comes from the Hcm query while the amount comes from the
 * SalaryCalculation query, so the two can briefly disagree between refetches.
 * A non-zero amount means the calculation did include SECA, which no status
 * can explain away, so the note stays silent until the amount catches up.
 */
export const getSecaNote = (
  { secaStatus, name, requestedSeca }: SecaNotePerson,
  t: TFunction,
): string | null => {
  if (includesSeca(requestedSeca)) {
    return null;
  }

  switch (secaStatus) {
    case SecaStatusEnum.Seca:
      return null;
    case SecaStatusEnum.Optout:
      return t('{{ name }} has opted out of SECA', { name });
    case SecaStatusEnum.Fica:
      return t('{{ name }} pays FICA instead of SECA', { name });
    case null:
    case undefined:
      return t(
        'HCM has no SECA status on file for {{ name }}, so no SECA is included and the cap may be too low. Contact HR or Payroll to fix it.',
        { name },
      );
    default:
      return unknownSecaStatus(secaStatus);
  }
};
