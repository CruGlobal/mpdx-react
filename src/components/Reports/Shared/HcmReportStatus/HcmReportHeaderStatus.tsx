import React from 'react';
import { HANDLED_HCM_ERROR_CODES } from 'src/components/HrTools/Shared/HcmData/hcmPersonNotFound';
import { HcmSyncHeaderStatus } from 'src/components/HrTools/Shared/HcmSyncStatus/HcmSyncStatus';
import { ReportHcmStatus } from '../Helpers/useReportHcm';

interface HcmReportHeaderStatusProps {
  hcm: ReportHcmStatus;
}

/** The HCM sync status for a report's header. */
export const HcmReportHeaderStatus: React.FC<HcmReportHeaderStatusProps> = ({
  hcm: { personNumber, skip },
}) => (
  <HcmSyncHeaderStatus
    personNumber={personNumber}
    skip={skip}
    suppressErrorCodes={HANDLED_HCM_ERROR_CODES}
  />
);
