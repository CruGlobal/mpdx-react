import React from 'react';
import { HcmPersonNotFoundAlert } from 'src/components/HrTools/Shared/HcmData/HcmPersonNotFoundAlert';
import { HANDLED_HCM_ERROR_CODES } from 'src/components/HrTools/Shared/HcmData/hcmPersonNotFound';
import { HcmSyncBodyStatus } from 'src/components/HrTools/Shared/HcmSyncStatus/HcmSyncStatus';

interface HcmReportBodyStatusProps {
  personNumber: string | undefined;
  isSupervisorView: boolean;
  hcmPersonNotFound: boolean;
}

/** The HCM sync status under a report's header, plus a note when HCM has no record of the person. */
export const HcmReportBodyStatus: React.FC<HcmReportBodyStatusProps> = ({
  personNumber,
  isSupervisorView,
  hcmPersonNotFound,
}) => (
  <>
    <HcmSyncBodyStatus
      personNumber={personNumber}
      skip={isSupervisorView && !personNumber}
      suppressErrorCodes={HANDLED_HCM_ERROR_CODES}
    />
    {hcmPersonNotFound && (
      <HcmPersonNotFoundAlert isSupervisorView={isSupervisorView} />
    )}
  </>
);
