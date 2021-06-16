import React, { useState } from 'react';
import {
  Box,
  Button,
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
import Loading from '../../../Loading';
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

  const [questionIndex, setQuestionIndex] = useState(0);

  const [responseValue, setResponseValue] = useState<string | null>(null);

  const answerSet = data?.coachingAnswerSets[currentAnswerSet];
  const questionCount = answerSet?.questions.length || 0;
  const question: FormQuestionFragment | undefined =
    answerSet?.questions[questionIndex];

  const hasNext = questionIndex < questionCount - 1;
  const hasPrevious = questionIndex !== 0;

  const next = () => {
    //saveAnswer(answerSet?.id, question?.id, question?.answer);
    if (hasNext) {
      setQuestionIndex(questionIndex + 1);

      setResponseValue(null);
    }
  };

  const previous = () => {
    if (hasPrevious) {
      setQuestionIndex(questionIndex - 1);

      setResponseValue(null);
    }
  };

  const progress = ((questionIndex + 1) / questionCount) * 100.0;

  const renderContent = () =>
    loading || !answerSet ? (
      <Loading />
    ) : questionCount > 0 && question ? (
      <Box>
        <ProgressBar variant="determinate" value={progress} />
        <CoachingQuestionResponseSection
          questionPrompt={question.prompt}
          responseOptions={question.responseOptions || null}
          selectedResponseValue={responseValue}
          onResponseChanged={setResponseValue}
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
            disabled={question.required && !responseValue}
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
