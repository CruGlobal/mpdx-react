import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { ReportSectionList } from '../../SharedComponents/SectionList';
import { SummaryReport } from '../../SummaryReport/SummaryReport';

export const ReportsStep: React.FC = () => (
  <GoalCalculatorLayout
    sectionListPanel={<ReportSectionList />}
    mainContent={<SummaryReport />}
  />
);
