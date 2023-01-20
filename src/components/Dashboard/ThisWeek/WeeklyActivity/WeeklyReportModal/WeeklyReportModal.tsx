import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { ElementOf } from 'ts-essentials';
import * as yup from 'yup';
import Modal from '../../../../common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../../../theme';
import {
  CurrentCoachingAnswerSetDocument,
  CurrentCoachingAnswerSetQuery,
  useCurrentCoachingAnswerSetQuery,
  useSaveCoachingAnswerMutation,
} from './WeeklyReportModal.generated';
import { useOrganizationId } from 'src/hooks/useOrganizationId';

const labelStyles = {
  fontSize: '1.5rem',
  lineHeight: 1.334,
  marginBottom: theme.spacing(2),
  color: `${theme.palette.text.primary} !important`,
  position: 'unset',
  textOverflow: 'unset',
  maxWidth: 'unset',
  transform: 'unset',
  whiteSpace: 'unset',
};

interface WeeklyReportProgressProps {
  totalSteps: number;
  activeStep: number;
}

export const WeeklyReportProgress = ({
  totalSteps,
  activeStep,
}: WeeklyReportProgressProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
    mb={1}
    data-testid="WeeklyReportModalStepCounterBox"
  >
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(activeStep / totalSteps) * 100}
      />
    </Box>
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        data-testid="WeeklyReportModalStepCounterCount"
      >{`${activeStep}/${totalSteps}`}</Typography>
    </Box>
  </Box>
);

interface WeeklyReportAlertsProps {
  questionsLength: number;
  activeStep: number;
  onClose: () => void;
}

export const WeeklyReportAlerts = ({
  questionsLength,
  activeStep,
  onClose,
}: WeeklyReportAlertsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DialogContent dividers data-testid="WeeklyReportModalAlerts">
        {questionsLength === 0 && (
          <Alert severity="warning">
            {t(
              'Weekly report questions have not been setup for your organization.',
            )}
          </Alert>
        )}
        {questionsLength > 0 && activeStep === questionsLength + 1 && (
          <Alert severity="success">
            Your report was successfully submitted. View it on your coaching
            reports page.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClose}>{t('Close')}</CancelButton>
      </DialogActions>
    </>
  );
};

interface WeeklyReportModalProps {
  accountListId: string;
  open: boolean;
  onClose: () => void;
}

export const WeeklyReportModal = ({
  accountListId,
  open,
  onClose,
}: WeeklyReportModalProps) => {
  const organizationId = useOrganizationId();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(1);

  const { data, refetch } = useCurrentCoachingAnswerSetQuery({
    variables: {
      accountListId,
      organizationId: organizationId ?? '',
    },
    skip: !organizationId,
  });
  const [saveAnswerMutation] = useSaveCoachingAnswerMutation();

  const answers = data?.currentCoachingAnswerSet.answers ?? [];
  const questions = data?.currentCoachingAnswerSet.questions ?? [];

  // Lookup the answer for a question
  const getAnswer = (
    questionId: string,
  ): ElementOf<
    CurrentCoachingAnswerSetQuery['currentCoachingAnswerSet']['answers']
  > | null =>
    answers.find((answer) => answer.question.id === questionId) ?? null;

  const initialValues = questions.map((q) => [
    q.id,
    getAnswer(q.id)?.response ?? '',
  ]);

  const saveAnswer = async (
    answerId: string | null,
    question: ElementOf<
      CurrentCoachingAnswerSetQuery['currentCoachingAnswerSet']['questions']
    >,
    response: string,
  ) => {
    if (!data) {
      return;
    }

    saveAnswerMutation({
      variables: {
        answerSetId: data.currentCoachingAnswerSet.id,
        answerId,
        response: response,
        questionId: question.id,
      },
      update: (cache, { data: saveAnswerData }) => {
        if (answerId || !saveAnswerData) {
          return;
        }

        cache.updateQuery<CurrentCoachingAnswerSetQuery>(
          {
            query: CurrentCoachingAnswerSetDocument,
            variables: {
              accountListId,
              organizationId: organizationId ?? '',
            },
          },
          (cachedData) =>
            cachedData && {
              ...cachedData,
              currentCoachingAnswerSet: {
                ...cachedData.currentCoachingAnswerSet,
                answers: [
                  ...cachedData.currentCoachingAnswerSet.answers,
                  saveAnswerData.saveCoachingAnswer,
                ],
              },
            },
        );
      },
    });
  };

  const handleWeeklyReportPrev = () => {
    setActiveStep((prevState) => prevState - 1); // advances active step by one
  };

  const handleWeeklyReportNext = () => {
    setActiveStep((prevState) => prevState + 1); // reduces active step by one
  };

  const localOnClose = () => {
    onClose(); // closes modal
    setTimeout(() => {
      // One second after the modal has faded out, reset the active step and refresh the current
      // coaching set to get a new, blank one in case the user just completed one
      setActiveStep(1);
      refetch();
    }, 1000);
  };

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={localOnClose}>
      <>
        {questions.map((question, index) => {
          const answerId = getAnswer(question.id)?.id ?? null;
          const currentQuestion = initialValues[index];
          return (
            <React.Fragment key={question.id}>
              {activeStep === index + 1 && (
                <Box sx={{ display: activeStep === index + 1 ? null : 'none' }}>
                  <Formik
                    initialValues={{
                      [currentQuestion[0]]: currentQuestion[1],
                    }}
                    validationSchema={yup.object().shape({
                      [question.id]: yup.string().required(t('Required')),
                    })}
                    onSubmit={(values: Record<string, string>) => {
                      saveAnswer(answerId, question, values[question.id]);
                      handleWeeklyReportNext();
                    }}
                  >
                    {({
                      errors,
                      handleSubmit,
                      isValid,
                      handleChange,
                      touched,
                      values,
                    }) => (
                      <form onSubmit={handleSubmit}>
                        <DialogContent dividers>
                          {activeStep <= questions.length && (
                            <WeeklyReportProgress
                              totalSteps={questions.length}
                              activeStep={activeStep}
                            />
                          )}
                          {question.responseOptions &&
                            question.responseOptions.length > 0 && (
                              <FormControl>
                                <FormLabel sx={labelStyles}>
                                  {question.prompt}
                                </FormLabel>
                                <RadioGroup
                                  name={question.id}
                                  onChange={handleChange}
                                  value={values[question.id]}
                                  row
                                >
                                  {question.responseOptions?.map(
                                    (option, index) => (
                                      <FormControlLabel
                                        key={`${question.id}|${index}`}
                                        value={option}
                                        control={<Radio />}
                                        label={option}
                                      />
                                    ),
                                  )}
                                </RadioGroup>
                              </FormControl>
                            )}
                          {(!question.responseOptions ||
                            question.responseOptions.length === 0) && (
                            <TextField
                              error={
                                touched[question.id] &&
                                Boolean(errors[question.id])
                              }
                              helperText={
                                touched[question.id] && errors[question.id]
                              }
                              InputLabelProps={{
                                shrink: true,
                                sx: labelStyles,
                              }}
                              InputProps={{
                                notched: false,
                              }}
                              label={question.prompt}
                              name={question.id}
                              onChange={handleChange}
                              rows={3}
                              value={values[question.id]}
                              variant="outlined"
                              fullWidth
                              multiline
                            />
                          )}
                        </DialogContent>
                        <DialogActions
                          sx={{
                            justifyContent:
                              activeStep === 1 ||
                              activeStep === questions.length + 1
                                ? 'flex-end'
                                : 'space-between',
                          }}
                        >
                          {activeStep > 1 && activeStep <= questions.length && (
                            <CancelButton
                              onClick={() => {
                                handleWeeklyReportPrev();
                                if (values[question.id] !== '') {
                                  saveAnswer(
                                    answerId,
                                    question,
                                    values[question.id],
                                  );
                                }
                              }}
                            >
                              {t('Back')}
                            </CancelButton>
                          )}
                          <SubmitButton
                            disabled={
                              !isValid ||
                              (isValid && values[question.id] === '')
                            }
                          >
                            {activeStep < questions.length
                              ? t('Next')
                              : t('Submit')}
                          </SubmitButton>
                        </DialogActions>
                      </form>
                    )}
                  </Formik>
                </Box>
              )}
            </React.Fragment>
          );
        })}
        {(questions.length === 0 || activeStep === questions.length + 1) && (
          <WeeklyReportAlerts
            questionsLength={questions.length}
            activeStep={activeStep}
            onClose={localOnClose}
          />
        )}
      </>
    </Modal>
  );
};
