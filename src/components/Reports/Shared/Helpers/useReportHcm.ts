import { useMemo } from 'react';
import { useHcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import {
  HANDLED_HCM_ERROR_CODES,
  isHcmPersonNotFoundError,
} from 'src/components/HrTools/Shared/HcmData/hcmPersonNotFound';
import { HouseholdMember } from './household';

interface UseReportHcmOptions {
  personNumber: string | undefined;
  skip: boolean;
}

/**
 * Loads a report's HCM household. Person numbers tell the reader's payroll from their spouse's;
 * HCM lists the reader first, then their spouse. A person HCM no longer knows comes back as
 * `hcmPersonNotFound` with no household, and the global error link does not toast it.
 */
export const useReportHcm = ({ personNumber, skip }: UseReportHcmOptions) => {
  const result = useHcmQuery({
    variables: { personNumber },
    skip,
    context: { suppressErrorCodes: HANDLED_HCM_ERROR_CODES },
  });
  const { data, error } = result;

  const household: HouseholdMember[] = useMemo(
    () =>
      data?.hcm.map(({ staffInfo }) => ({
        personNumber: staffInfo.personNumber,
        name: staffInfo.preferredName ?? staffInfo.lastName,
      })) ?? [],
    [data],
  );

  return {
    ...result,
    household,
    hcmPersonNotFound: isHcmPersonNotFoundError(error),
  };
};
