import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  LinearProgress,
  styled,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';
import { CloseOutlined } from '@material-ui/icons';
import {
  FormQuestionFragment,
  useGetCoachingAnswerSetsQuery,
} from '../GetCoachingAnswerSets.generated';
import Loading from '../../../Loading';
import CoachingQuestionResponseSection from './CoachingQuestionResponseSection/CoachingQuestionResponseSection';

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

  const [responseValue, setResponseValue] = useState<string>();

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

      setResponseValue(undefined);
    }
  };

  const previous = () => {
    if (hasPrevious) {
      setQuestionIndex(questionIndex - 1);

      setResponseValue(undefined);
    }
  };

  const progress = ((questionIndex + 1) / questionCount) * 100.0;

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
        ) : questionCount > 0 && question ? (
          <Box>
            <ProgressBar variant="determinate" value={progress} />
            <CoachingQuestionResponseSection
              question={question}
              onResponseChanged={setResponseValue}
            />
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
          </Box>
        ) : (
          <NoQuestionsAlert severity="warning">
            {t(
              'Weekly report questions have not been setup for your organization',
            )}
          </NoQuestionsAlert>
        )}
      </ModalContentWrap>
    </DrawerModal>
  );
};

export default CoachingQuestionsModal;
