import React, { useState } from 'react';
import { Box, Button, styled, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import Loading from '../../../Loading';
import { useGetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';

interface Props {
  accountListId: string;
}
interface MockQuestion {
  prompt: string;
  answer: { response: string };
}

interface MockAnswerSet {
  completed_at: string;
  questions: MockQuestion[];
}

const Header = styled(Box)(({}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));
const QuestionWrap = styled(Box)(({}) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: 2,
  rowGap: 2,
  h5: {
    fontWeight: 'bold',
  },
}));

const WeeklyReport: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const { data, loading } = useGetCoachingAnswerSetsQuery({
    variables: { accountListId },
  });

  const answerSets: MockAnswerSet[] = [
    { completed_at: '2020-12-30', questions: [] },
    { completed_at: '2020-06-06', questions: [] },
  ]; //replace with GQL

  const [currentAnswerSet, setCurrentAnswerSet] = useState(0);

  const hasNext = () => currentAnswerSet > 0;

  const next = () => {
    if (hasNext()) {
      setCurrentAnswerSet(currentAnswerSet - 1);
    }
  };

  const hasPrevious = () => currentAnswerSet < answerSets.length - 1;

  const previous = () => {
    if (hasPrevious()) {
      setCurrentAnswerSet(currentAnswerSet + 1);
    }
  };

  const renderQuestionRow = (question: MockQuestion) => (
    <Box>
      <Typography variant="h5">{question.prompt}</Typography>
      <Typography>{question.answer.response}</Typography>
    </Box>
  );

  const renderQuestionList = () => {
    if (answerSets.length === 0) {
      return <Typography>{t('No anwsers found.')}</Typography>;
    }

    const { questions } = answerSets[currentAnswerSet];

    <QuestionWrap>{questions.map(renderQuestionRow)}</QuestionWrap>;
  };

  const renderLoading = () => (
    <Box>
      <Loading />
    </Box>
  );

  return (
    <Box>
      <Header>
        <Typography>{t('Weekly Report')}</Typography>
        <Typography>{answerSets[currentAnswerSet].completed_at}</Typography>
        <Box>
          <Button onClick={previous} disabled={hasPrevious()}>
            <ChevronLeft />
            <Typography>{t('Previous')}</Typography>
          </Button>
          <Button onClick={next} disabled={hasNext()}>
            <Typography>{t('Next')}</Typography>
            <ChevronRight />
          </Button>
        </Box>
      </Header>
      {loading ? renderLoading() : renderQuestionList()}
    </Box>
  );
};

export default WeeklyReport;
