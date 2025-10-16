import { Box } from '@mui/material';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { ReportSectionList } from '../SharedComponents/SectionList';
import { SummaryReport } from './SummaryReport';

export const ReportsStep: React.FC = () => (
  <GoalCalculatorLayout
    sectionListPanel={<ReportSectionList />}
    mainContent={
      <Box mx={4}>
        <SummaryReport />
      </Box>
    }
  />
);
