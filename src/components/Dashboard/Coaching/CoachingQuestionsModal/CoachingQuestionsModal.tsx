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
  display: 'flex',
  flexDirection: 'column',
  padding: 24,
}));

const NoQuestionsAlert = styled(Alert)(({}) => ({}));

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

const PromptText = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  flex: 1,
  marginHorizontal: 24,
}));

const ShortAnswer = styled(TextField)(({}) => ({
  flex: 1,
  margin: 12,
}));

const RadioPill = styled(Radio)(({}) => ({}));

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
          <>
            <ProgressBar variant="determinate" value={progress} />
            <PromptText>{question.prompt}</PromptText>
            {question.responseOptions !== null ? (
              <Box></Box>
            ) : (
              <ShortAnswer
                multiline
                rows={4}
                variant="outlined"
                placeholder={t('Response')}
              />
            )}
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
                  disabled={question.required && !question.answer.response}
                >
                  <Typography>{t(hasNext ? 'Next' : 'Submit')}</Typography>
                </NavButton>
              </NextWrap>
            </ActionButtonWrap>
          </>
        )}
      </ModalContentWrap>
    </DrawerModal>
  );
};

export default CoachingQuestionsModal;
