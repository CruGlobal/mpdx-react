import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  LinearProgress,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useGetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import Loading from '../../../Loading';

interface Props {
  accountListId: string;
}

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.cruGrayLight.main,
  barColorPrimary: theme.palette.mpdxBlue.main,
}));

const CoachingQuestionsModal: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();

  const currentAnswerSet = 0;

  const { data, loading } = useGetCoachingAnswerSetsQuery({
    variables: { accountListId },
  });

  const [questionIndex, setQuestionIndex] = useState(0);

  const onClose = () => {
    //close
  };

  const answerSet = data && data[currentAnswerSet];
  const questionCount = answerSet?.questions.length || 0;
  const question = answerSet?.questions[questionIndex];

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

  const progress = (questionIndex / questionCount) * 10.0;

  return (
    <Drawer title={t('Weekly Report')} onClose={onClose}>
      <ProgressBar variant="determinate" value={progress} />
      {loading || !answerSet ? (
        <Loading />
      ) : questionCount === 0 ? (
        <Typography>
          {t(
            'Weekly report questions have not been setup for your organization',
          )}
        </Typography>
      ) : (
        <Box>
          <Typography>{question.prompt}</Typography>
          {question.response_options === null ? (
            <Box></Box>
          ) : (
            <TextField></TextField>
          )}
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
