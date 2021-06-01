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
  display: 'flex',
  width: 640,
}));

const ModalHeaderWrap = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '20px 0px 20px 0px',
}));

const HeaderText = styled(Typography)(({}) => ({
  flex: 1,
  textAlign: 'center',
}));

const ModalContentWrap = styled(Box)(({}) => ({
  padding: '20px 10px 20px 10px',
}));

const NoQuestionsAlert = styled(Alert)(({}) => ({}));

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

const ShortAnswer = styled(TextField)(({}) => ({
  width: '100%',
  border: '1px solid #000000',
  borderRadius: 3.5,
  margin: 6,
  padding: 2,
}));

const RadioPill = styled(Radio)(({}) => ({}));

const ActionButtonWrap = styled(Box)(({}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 2,
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

  const progress = (questionIndex / questionCount) * 10.0;

  return (
    <DrawerModal anchor="top" open={isOpen}>
      <ModalHeaderWrap>
        <HeaderText variant="h4">{t('Weekly Report').toUpperCase()}</HeaderText>
        <IconButton onClick={closeDrawer}>
          <CloseOutlined />
        </IconButton>
      </ModalHeaderWrap>
      <ModalContentWrap>
        {loading || !answerSet ? (
          <Loading />
        ) : questionCount === 0 ? (
          <NoQuestionsAlert severity="warning">
            {t(
              'Weekly report questions have not been setup for your organization',
            )}
          </NoQuestionsAlert>
        ) : (
          <Box>
            <ProgressBar variant="determinate" value={progress} />
            <Typography variant="h5">{question.prompt}</Typography>
            {question.responseOptions === null ? (
              <Box></Box>
            ) : (
              <ShortAnswer></ShortAnswer>
            )}
            <ActionButtonWrap>
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
            </ActionButtonWrap>
          </Box>
        )}
      </ModalContentWrap>
    </DrawerModal>
  );
};

export default CoachingQuestionsModal;
