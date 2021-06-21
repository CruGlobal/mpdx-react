import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  styled,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';
import {
  FormQuestionFragment,
  useGetCoachingAnswerSetsQuery,
} from '../GetCoachingAnswerSets.generated';
import Modal from '../../../common/Modal/Modal';
import CoachingQuestionResponseSection from './CoachingQuestionResponseSection/CoachingQuestionResponseSection';

interface Props {
  accountListId: string;
  isOpen: boolean;
  closeDrawer: () => void;
}

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 16,
  borderRadius: 8,
  backgroundColor: theme.palette.cruGrayLight.main,
  barColorPrimary: theme.palette.mpdxBlue.main,
  marginBottom: 24,
}));

const ActionButtonWrap = styled(Box)(({}) => ({
  display: 'flex',
  flex: 1,
}));

const PreviousWrap = styled(Box)(({}) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
}));

const NextWrap = styled(Box)(({}) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
}));

const NavButton = styled(Button)(({}) => ({
  height: 48,
  width: 96,
}));

const CoachingQuestionsModal: React.FC<Props> = ({
  accountListId,
  isOpen,
  closeDrawer,
}) => {
  const { t } = useTranslation();

  const currentAnswerSet = 0;

  const { data, loading } = useGetCoachingAnswerSetsQuery({
    variables: { accountListId },
  });
  //const [saveAnswer] = useSaveAnswerMutation();
  debugger;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responseValues, setResponseValues] = useState<(string | null)[]>([]);

  const answerSet = data?.coachingAnswerSets[currentAnswerSet];
  const questions = answerSet?.questions;
  const questionCount = questions?.length || 0;
  const question: FormQuestionFragment | null =
    (questions && questions[questionIndex]) || null;

  const hasNext = questionIndex < questionCount - 1;
  const hasPrevious = questionIndex !== 0;

  const currentResponse = responseValues[questionIndex] || null;

  const setCurrentResponse = (value: string | null) => {
    debugger;
    const newResponseValues = responseValues;
    newResponseValues[questionIndex] = value;

    setResponseValues(newResponseValues);
  };

  const next = () => {
    hasNext && setQuestionIndex(questionIndex + 1);
  };

  const previous = () => {
    hasPrevious && setQuestionIndex(questionIndex - 1);
  };

  const progress = (questionIndex / questionCount) * 100.0;

  const renderContent = () =>
    loading || !answerSet ? (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    ) : questionCount > 0 && question ? (
      <Box>
        <ProgressBar variant="determinate" value={progress} />
        <CoachingQuestionResponseSection
          questionIndex={questionIndex}
          responseValue={currentResponse}
          question={question}
          onResponseChanged={setCurrentResponse}
        />
      </Box>
    ) : (
      <Alert severity="warning">
        {t('Weekly report questions have not been setup for your organization')}
      </Alert>
    );

  const renderActionSection = () =>
    loading || !answerSet || questionCount === 0 || !question ? (
      <Box />
    ) : (
      <ActionButtonWrap>
        <PreviousWrap>
          {hasPrevious ? (
            <NavButton onClick={previous}>
              <Typography>{t('Back')}</Typography>
            </NavButton>
          ) : null}
        </PreviousWrap>
        <NextWrap>
          <NavButton
            onClick={next}
            disabled={question.required && !currentResponse}
          >
            <Typography>{t(hasNext ? 'Next' : 'Submit')}</Typography>
          </NavButton>
        </NextWrap>
      </ActionButtonWrap>
    );

  return (
    <Modal
      isOpen={isOpen}
      title={t('Weekly Report').toUpperCase()}
      content={renderContent()}
      customActionSection={renderActionSection()}
      handleClose={closeDrawer}
    />
  );
};

export default CoachingQuestionsModal;
