import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadMpdSupervisorReportFilterPanel = () =>
  import(
    /* webpackChunkName: "MpdSupervisorReportFilterPanel" */ './MpdSupervisorReportFilterPanel'
  ).then(
    ({ MpdSupervisorReportFilterPanel }) => MpdSupervisorReportFilterPanel,
  );

export const DynamicMpdSupervisorReportFilterPanel = dynamic(
  preloadMpdSupervisorReportFilterPanel,
  {
    loading: DynamicComponentPlaceholder,
  },
);
