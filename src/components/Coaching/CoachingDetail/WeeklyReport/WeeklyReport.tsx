import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button, ButtonGroup, CardHeader } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { MultilineSkeleton } from 'src/components/Shared/MultilineSkeleton';
import { Header } from 'src/components/Shared/styledComponents/Header';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat, dateFormatWithoutYear } from 'src/lib/intlFormat';
import { ContentContainer } from '../StyledComponents';
import { useWeeklyReportsQuery } from './WeeklyReport.generated';

const CompletedText = styled('span')({
  textAlign: 'center',
  flex: 1,
});

const StyledButton = styled(Button)({
  width: '6rem',
});

const AnswersContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(4),
  '@media (max-width: 1150px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
}));

const AnswerContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const QuestionText = styled('p')({
  fontWeight: 'bold',
});

interface WeeklyReportProps {
  accountListId: string;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [reportIndex, setReportIndex] = useState(0);

  const { data, loading } = useWeeklyReportsQuery({
    variables: { accountListId },
  });
  const reports = data?.coachingAnswerSets ?? [];
  const report = reports[reportIndex];

  // Sort the answers by their position
  const answers = useMemo(() => {
    if (!report) {
      return [];
    }

    const answers = report.answers.slice(0);
    answers.sort(
      (answer1, answer2) =>
        answer1.question.position - answer2.question.position,
    );
    return answers;
  }, [report]);

  const completedDate = useMemo(() => {
    if (!report?.completedAt) {
      return null;
    }

    const date = DateTime.fromISO(report.completedAt);
    const format =
      date.year === DateTime.now().year ? dateFormatWithoutYear : dateFormat;
    return format(date, locale);
  }, [report, locale]);

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Header variant="h6">
            <span>{t('Weekly Report')}</span>
            <CompletedText data-testid="CompletedText">
              {completedDate}
            </CompletedText>
            <ButtonGroup>
              <StyledButton
                onClick={() => setReportIndex(reportIndex + 1)}
                disabled={reportIndex >= reports.length - 1}
              >
                <ChevronLeft />
                {t('Previous')}
              </StyledButton>
              <StyledButton
                onClick={() => setReportIndex(reportIndex - 1)}
                disabled={reportIndex === 0}
              >
                {t('Next')}
                <ChevronRight />
              </StyledButton>
            </ButtonGroup>
          </Header>
        }
      />
      <ContentContainer>
        {loading ? (
          <MultilineSkeleton lines={4} height={80} />
        ) : reports.length === 0 ? (
          t('No completed reports found')
        ) : (
          <AnswersContainer>
            {answers.map((answer) => (
              <AnswerContainer key={answer.id} data-testid="Answer">
                <QuestionText role="heading">
                  {answer.question.prompt}
                </QuestionText>
                <p>{answer.response}</p>
              </AnswerContainer>
            ))}
          </AnswersContainer>
        )}
      </ContentContainer>
    </AnimatedCard>
  );
};
