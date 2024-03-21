import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicWeeklyReportModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "WeeklyReportModal" */ './WeeklyReportModal'
    ).then(({ WeeklyReportModal }) => WeeklyReportModal),
  { loading: DynamicModalPlaceholder },
);
