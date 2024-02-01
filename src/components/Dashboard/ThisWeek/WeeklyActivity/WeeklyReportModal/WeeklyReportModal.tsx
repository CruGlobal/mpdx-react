import React, { useState } from 'react';
import {
  Box,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { ElementOf } from 'ts-essentials';
import * as yup from 'yup';
import { useOrganizationId } from 'src/hooks/useOrganizationId';
import theme from '../../../../../theme';
import Modal from '../../../../common/Modal/Modal';
import {
  CurrentCoachingAnswerSetDocument,
  CurrentCoachingAnswerSetQuery,
  useCurrentCoachingAnswerSetQuery,
  useSaveCoachingAnswerMutation,
} from './WeeklyReportModal.generated';
import { WeeklyReportActions } from './WeeklyReportModalActions';
import { WeeklyReportAlerts } from './WeeklyReportModalAlerts';
import { WeeklyReportProgress } from './WeeklyReportModalProgress';

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

type Question = ElementOf<
  CurrentCoachingAnswerSetQuery['currentCoachingAnswerSet']['questions']
>;

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
    question: Question,
    response: string,
  ) => {
    if (!data) {
      return;
    }

    saveAnswerMutation({
      variables: {
        answerSetId: data.currentCoachingAnswerSet.id,
        answerId,
        response,
        questionId: question.id,
      },
      update: (cache, { data: saveAnswerData }) => {
        // When a new answer was created, add it to the cached answer set
        // When an answer is updated, Apollo will automatically update the cache, so no action is required
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

          const schema = yup.object().shape({
            [question.id]: yup.string().required(t('Required')),
          });

          return (
            <React.Fragment key={question.id}>
              {activeStep === index + 1 && (
                <Box sx={{ display: activeStep === index + 1 ? null : 'none' }}>
                  <Formik
                    initialValues={{
                      [currentQuestion[0]]: currentQuestion[1],
                    }}
                    validationSchema={schema}
                    onSubmit={(values: yup.InferType<typeof schema>) => {
                      saveAnswer(answerId, question, values[question.id]);
                      handleWeeklyReportNext();
                    }}
                  >
                    {({
                      errors,
                      handleSubmit,
                      isValid,
                      handleChange,
                      handleBlur,
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
                              onBlur={handleBlur}
                              rows={3}
                              value={values[question.id]}
                              variant="outlined"
                              fullWidth
                              multiline
                            />
                          )}
                        </DialogContent>
                        <WeeklyReportActions
                          questionsLength={questions.length}
                          activeStep={activeStep}
                          prevQuestion={handleWeeklyReportPrev}
                          save={() => {
                            saveAnswer(answerId, question, values[question.id]);
                          }}
                          value={values[question.id]}
                          isValid={isValid}
                        />
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
