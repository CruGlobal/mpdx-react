import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  LinearProgress,
  Radio,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';
import { CloseOutlined } from '@material-ui/icons';
import { useGetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import Loading from '../../../Loading';

interface Props {
  accountListId: string;
  isOpen: boolean;
  closeDrawer: () => void;
}

const DrawerModal = styled(Drawer)(({}) => ({
  width: 640,
}));

const ModalHeaderWrap = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: 0,
  alignItems: 'center',
}));

const HeaderText = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  flex: 1,
  textAlign: 'center',
  color: theme.palette.text.primary,
}));

const CloseButton = styled(IconButton)(({}) => ({
  width: 48,
  height: 48,
}));

const CloseButtonIcon = styled(CloseOutlined)(({}) => ({
  fontSize: 32,
}));

const ModalContentWrap = styled(Box)(({}) => ({
  padding: '32px 24px 32px 24px',
}));

const NoQuestionsAlert = styled(Alert)(({}) => ({}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 16,
  borderRadius: 5,
  backgroundColor: theme.palette.cruGrayLight.main,
  barColorPrimary: theme.palette.mpdxBlue.main,
}));

const PromptText = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  margin: 12,
}));

const ShortAnswer = styled(TextField)(({}) => ({
  width: '100%',
  border: '1px solid #000000',
  borderRadius: 3.5,
  margin: 6,
  padding: 2,
}));

const RadioPill = styled(Radio)(({}) => ({}));

const ActionButtonWrap = styled(Box)(({}) => ({
  width: '100%',
  marginTop: 2,
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

  const answerSet = data?.coachingAnswerSets[currentAnswerSet];
  const questionCount = answerSet?.questions.length || 0;
  const question = answerSet?.questions[questionIndex];

  const hasNext = questionIndex < questionCount - 1;
  const hasPrevious = questionIndex !== 0;

  const next = () => {
    //saveAnswer(answerSet?.id, question?.id, question?.answer);
    if (hasNext) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const previous = () => {
    if (hasPrevious) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const progress = (questionIndex / questionCount) * 100.0;

  return (
    <DrawerModal anchor="top" open={isOpen}>
      <ModalHeaderWrap>
        <HeaderText>{t('Weekly Report').toUpperCase()}</HeaderText>
        <CloseButton onClick={closeDrawer}>
          <CloseButtonIcon />
        </CloseButton>
      </ModalHeaderWrap>
      <ModalContentWrap>
        {loading || !answerSet ? (
          <Loading />
        ) : questionCount === 0 || !question ? (
          <NoQuestionsAlert severity="warning">
            {t(
              'Weekly report questions have not been setup for your organization',
            )}
          </NoQuestionsAlert>
        ) : (
          <Box>
            <ProgressBar variant="determinate" value={progress} />
            <PromptText>{question.prompt}</PromptText>
            {question.responseOptions !== null ? (
              <Box></Box>
            ) : (
              <ShortAnswer></ShortAnswer>
            )}
            <ActionButtonWrap>
              <PreviousWrap>
                {hasPrevious ? (
                  <Button onClick={previous}>
                    <Typography>{t('Back')}</Typography>
                  </Button>
                ) : null}
              </PreviousWrap>
              <NextWrap>
                <Button
                  onClick={next}
                  disabled={question.required && !question.answer.response}
                >
                  <Typography>{t(hasNext ? 'Next' : 'Submit')}</Typography>
                </Button>
              </NextWrap>
            </ActionButtonWrap>
          </Box>
        )}
      </ModalContentWrap>
    </DrawerModal>
  );
};

export default CoachingQuestionsModal;
