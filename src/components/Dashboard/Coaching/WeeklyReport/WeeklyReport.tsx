import React, { useState } from 'react';
import { Box, Button, Popover, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import Loading from '../../../Loading';
import { useGetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';

interface Props {
  accountListId: string;
}

const WeeklyReport: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const { data, loading, refetch } = useGetCoachingAnswerSetsQuery({
    variables: { accountListId },
  });

  const answerSets = []; //replace with GQL

  const [currentAnswerSet, setCurrentAnswerSet] = useState(0);

  const onChanges = () => {
    setCurrentAnswerSet(0);
    load();
  };

  const load = () => {
    setLoading(true);
  };

  const activate = () => {};

  const cancel = () => {};

  const back = () => {};

  const hasNext = () => {};

  const next = () => {};

  const hasPrevious = () => {};

  const previous = () => {};

  const getFirstQuestion = () => currentQuestion === 0;

  const getFinalQuestion = () =>
    currentQuestion >= answerSet?.questions.length - 1;

  const renderQuestionRow = (question: any) => (
    <Box>
      <Typography>{question.prompt}</Typography>
      <Typography>{question.answer.response}</Typography>
    </Box>
  );

  const renderQuestionList = () => {
    if (answerSets.length === 0) {
      return <Typography>{t('No anwsers found.')}</Typography>;
    }

    const { questions } = answerSets[currentAnswerSet];

    <Box>{questions.map(renderQuestionRow)}</Box>;
  };

  const renderLoading = () => (
    <Box>
      <Loading />
    </Box>
  );

  return (
    <Popover>
      <Typography>{t('Weekly Report')}</Typography>
      <Typography>
        {answerSets[currentAnswerSet].completed_at | date}
      </Typography>
      <Box>
        <Button onClick={previous}>
          <ChevronLeft />
          <Typography>{t('Previous')}</Typography>
        </Button>
        <Button onClick={next}>
          <Typography>{t('Next')}</Typography>
          <ChevronRight />
        </Button>
      </Box>
      {loading ? renderLoading() : renderQuestionList()}
    </Popover>
  );
};

export default WeeklyReport;
