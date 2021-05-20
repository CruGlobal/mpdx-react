import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  LinearProgress,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
}

interface MockQuestion {
  prompt: string;
  required: boolean;
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

  const [questionIndex, setQuestionIndex] = useState(0);

  const questionCount = answerSet.questions.length;
  const question = answerSet.questions[questionIndex];

  const hasNext = questionIndex < questionCount - 1;
  const hasPrevious = questionIndex !== 0;

  const next = () => {
    if (hasNext) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const previous = () => {
    if (hasPrevious) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const onClose = () => {};

  const renderNull = () => (
    <Typography>
      {t('Weekly report questions have not been setup for your organization')}
    </Typography>
  );

  const renderResponseOptions = () => {
    <Field></Field>;
  };

  const renderShortAnswerField = () => <TextField></TextField>;

  const progress = (questionIndex / questionCount) * 10.0;

  return (
    <Drawer title={t('Weekly Report')} onClose={onClose}>
      <LinearProgress variant="determinate" value={progress} />
      {questionCount === 0 ? (
        renderNull()
      ) : (
        <Box>
          <Typography>{question.prompt}</Typography>
          {question.response_options === null
            ? renderShortAnswerField()
            : renderResponseOptions()}
          <Box>
            {hasPrevious ? (
              <Button onClick={previous}>
                <Typography>{t('Back')}</Typography>
              </Button>
            ) : null}
            <Button
              onClick={next}
              disabled={question.required && !question.answer.response}
            >
              <Typography>{t(hasNext ? 'Next' : 'Submit')}</Typography>
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default CoachingQuestionsModal;
