import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  LinearProgress,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { DateTime } from 'luxon';
import Loading from '../../../Loading';
import { useGetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';

interface Props {
  accountListId: string;
}

interface MockQuestion {
  prompt: string;
  response_options: string[] | null;
  answer: { response: string };
}

interface MockAnswerSet {
  completed_at: string;
  questions: MockQuestion[];
}

const CoachingQuestionsModal: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const currentAnswerSet = 0;
  const answerSet: MockAnswerSet = {
    completed_at: '2020-12-30',
    questions: [],
  };

  /*const { data, loading, refetch } = useGetCoachingAnswerSetsQuery({
    variables: { accountListId },
  });*/

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const onChanges = () => {
    setCurrentAnswerSet(0);
    load();
  };

  const load = () => {
    refetch();
  };

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

  const renderNull = () => (
    <Typography>
      {t('Weekly report questions have not been setup for your organization')}
    </Typography>
  );

  const renderResponseOptions = () => {
    <Field></Field>;
  };

  const renderShortAnswerField = () => <TextField></TextField>;

  const progress = (currentQuestion / answerSet.questions.length) * 10.0;

  return (
    <Drawer title={t('Weekly Report')} onClose={onClose}>
      <LinearProgress variant="determinate" value={progress} />
      {answerSet.questions.length === 0 ? (
        renderNull()
      ) : (
        <Box>
          <Typography>{answerSet.questions[currentQuestion].prompt}</Typography>
          {answerSet.questions[currentQuestion].response_options === null
            ? renderShortAnswerField()
            : renderResponseOptions()}
          <Box>
            <Button>
              <Typography>{t('Back')}</Typography>
            </Button>
            <Button>
              <Typography>{t('Next')}</Typography>
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default CoachingQuestionsModal;
