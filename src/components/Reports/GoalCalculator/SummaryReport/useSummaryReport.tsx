import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { GoalCalculatorLayout } from '../Shared/GoalCalculatorLayout';
import { ReportSectionList } from '../SharedComponents/SectionList';
import { SummaryReport } from './SummaryReport';

const SummaryReportPage: React.FC = () => (
  <GoalCalculatorLayout
    sectionListPanel={<ReportSectionList />}
    mainContent={<SummaryReport />}
  />
);

export const useSummaryReport = (): GoalCalculatorStep => {
  const { t } = useTranslation();

  return {
    title: t('Summary Report'),
    id: GoalCalculatorStepEnum.SummaryReport,
    icon: <RequestQuoteIcon />,
    PageComponent: SummaryReportPage,
  };
};
