import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadWeeklyReportModal = () =>
  import(
    /* webpackChunkName: "WeeklyReportModal" */ './WeeklyReportModal'
  ).then(({ WeeklyReportModal }) => WeeklyReportModal);

export const DynamicWeeklyReportModal = dynamic(preloadWeeklyReportModal, {
  loading: DynamicModalPlaceholder,
});
