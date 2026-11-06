import { useMemo } from 'react';
import { useHcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import {
  HANDLED_HCM_ERROR_CODES,
  isHcmPersonNotFoundError,
} from 'src/components/HrTools/Shared/HcmData/hcmPersonNotFound';
import { HouseholdMember } from './household';

interface UseReportHcmOptions {
  personNumber: string | undefined;
  /** Set when a supervisor is viewing someone else's report */
  isSupervisorView: boolean;
}

/** What a report's HCM status components need. */
export interface ReportHcmStatus {
  personNumber: string | undefined;
  /** A supervisor view without a person number has no HCM record to load */
  skip: boolean;
  isSupervisorView: boolean;
  hcmPersonNotFound: boolean;
}

/**
 * Loads a report's HCM household. Person numbers tell the reader's payroll from their spouse's;
 * HCM lists the reader first, then their spouse. A person HCM no longer knows comes back as
 * `hcmPersonNotFound` with no household, and the global error link does not toast it.
 */
export const useReportHcm = ({
  personNumber,
  isSupervisorView,
}: UseReportHcmOptions) => {
  const skip = isSupervisorView && !personNumber;
  const result = useHcmQuery({
    variables: { personNumber },
    skip,
    context: { suppressErrorCodes: HANDLED_HCM_ERROR_CODES },
  });
  const { data, error } = result;
  const hcmPersonNotFound = isHcmPersonNotFoundError(error);

  const household: HouseholdMember[] = useMemo(
    () =>
      data?.hcm.map(({ staffInfo }) => ({
        personNumber: staffInfo.personNumber,
        name: staffInfo.preferredName ?? staffInfo.lastName,
      })) ?? [],
    [data],
  );

  const hcmStatus: ReportHcmStatus = useMemo(
    () => ({ personNumber, skip, isSupervisorView, hcmPersonNotFound }),
    [personNumber, skip, isSupervisorView, hcmPersonNotFound],
  );

  return { ...result, household, hcmPersonNotFound, hcmStatus };
};
