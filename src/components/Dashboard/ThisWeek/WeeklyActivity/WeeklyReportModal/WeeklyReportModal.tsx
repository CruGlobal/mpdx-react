import React, { ChangeEventHandler, FocusEventHandler, useState } from 'react';
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
import Modal from '../../../../common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../../../theme';
import { CoachingQuestion } from '../../../../../../graphql/types.generated';
import {
  CurrentCoachingAnswerSetDocument,
  CurrentCoachingAnswerSetQuery,
  useCurrentCoachingAnswerSetQuery,
  useSaveCoachingAnswerMutation,
} from './WeeklyReportModal.generated';
import { ErrorMessage, Formik } from 'formik';
import { useOrganizationId } from 'src/hooks/useOrganizationId';
import { ElementOf } from 'ts-essentials';
import * as yup from 'yup';

const labelStyles = {
  fontSize: '1.5rem',
  lineHeight: 1.334,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  position: 'unset',
  textOverflow: 'unset',
  maxWidth: 'unset',
  transform: 'unset',
  whiteSpace: 'unset',
};

interface WeeklyReportInputProps {
  question: Pick<CoachingQuestion, 'id' | 'prompt' | 'responseOptions'>;
  value: string;
  show: boolean;
  onBlur: FocusEventHandler;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const WeeklyReportRadio = ({
  question,
  value,
  show,
  onBlur,
  onChange,
}: WeeklyReportInputProps) => (
  <FormControl sx={{ display: show ? 'inline-flex' : 'none' }}>
    <FormLabel sx={labelStyles}>{question.prompt}</FormLabel>
    <RadioGroup
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      name={question.id}
      row
    >
      {question.responseOptions?.map((option, index) => (
        <FormControlLabel
          key={`${question.id}|${index}`}
          value={option}
          control={<Radio />}
          label={option}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

const WeeklyReportTextField = ({
  question,
  value,
  show,
  onBlur,
  onChange,
}: WeeklyReportInputProps) => (
  <TextField
    sx={{ display: show ? 'inline-flex' : 'none' }}
    value={value}
    onBlur={onBlur}
    onChange={onChange}
    name={question.id}
    rows={3}
    label={question.prompt}
    InputLabelProps={{
      shrink: true,
      sx: labelStyles,
    }}
    InputProps={{
      notched: false,
    }}
    variant="outlined"
    multiline
    fullWidth
  />
);

interface WeeklyReportProgressProps {
  totalSteps: number;
  activeStep: number;
}

const WeeklyReportProgress = ({
  totalSteps,
  activeStep,
}: WeeklyReportProgressProps) => {
  if (activeStep <= totalSteps) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        mb={1}
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
          >{`${activeStep}/${totalSteps}`}</Typography>
        </Box>
      </Box>
    );
  } else {
    return null;
  }
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
  const [formData, setFormData] = useState([]);

  const { data } = useCurrentCoachingAnswerSetQuery({
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
    setActiveStep((prevState) => prevState - 1);
  };

  const handleWeeklyReportNext = () => {
    setActiveStep((prevState) => prevState + 1);
  };

  const localOnClose = () => {
    onClose();
    setTimeout(() => {
      setActiveStep(1);
    }, 1000);
  };

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={localOnClose}>
      <>
        {/* {console.log(questions.length)} */}
        {questions.map((question, index) => {
          const answerId = getAnswer(question.id)?.id ?? null;
          const currentQuestion = initialValues[index];
          if (activeStep === index + 1) {
            return (
              <Box
                sx={{ display: index === activeStep - 1 ? 'block' : 'none' }}
                key={question.id}
              >
                <Formik
                  initialValues={{
                    [currentQuestion[0]]: currentQuestion[1],
                  }}
                  validationSchema={yup.object().shape({
                    [question.id]: yup.string().required('Required'),
                  })}
                  onSubmit={(values) => {
                    const data = { ...formData, ...values };
                    setFormData(data);
                    handleWeeklyReportNext();
                    console.log(values);
                  }}
                >
                  {({
                    values,
                    setFieldValue,
                    handleSubmit,
                    isSubmitting,
                    isValid,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <DialogContent dividers>
                        <>
                          <WeeklyReportProgress
                            totalSteps={questions.length}
                            activeStep={activeStep}
                          />
                          {question.responseOptions &&
                            question.responseOptions.length > 0 && (
                              <WeeklyReportRadio
                                key={question.id}
                                question={question}
                                value={values[question.id]}
                                onBlur={() => {
                                  saveAnswer(
                                    answerId,
                                    question,
                                    values[question.id],
                                  );
                                }}
                                onChange={(event) => {
                                  setFieldValue(
                                    question.id,
                                    event.target.value,
                                  );
                                }}
                                show={activeStep === index + 1}
                              />
                            )}
                          {(!question.responseOptions ||
                            question.responseOptions.length === 0) && (
                            <WeeklyReportTextField
                              key={question.id}
                              question={question}
                              value={values[question.id]}
                              onBlur={() => {
                                saveAnswer(
                                  answerId,
                                  question,
                                  values[question.id],
                                );
                              }}
                              onChange={(event) => {
                                setFieldValue(question.id, event.target.value);
                              }}
                              show={activeStep === index + 1}
                            />
                          )}
                        </>
                        <ErrorMessage name={question.id}>
                          {(msg) => (
                            <Typography sx={{ color: 'error.main' }}>
                              {msg}
                            </Typography>
                          )}
                        </ErrorMessage>
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
                          <CancelButton onClick={handleWeeklyReportPrev}>
                            {t('Back')}
                          </CancelButton>
                        )}
                        {activeStep < questions.length && ( // TODO: Disable button when currently visible field has no value
                          <SubmitButton disabled={!isValid || isSubmitting}>
                            {t('Next')}
                          </SubmitButton>
                        )}
                        {activeStep === questions.length && ( // TODO: Disable button when currently visible field has no value or isSubmitting
                          <SubmitButton disabled={!isValid || isSubmitting} />
                        )}
                      </DialogActions>
                    </form>
                  )}
                </Formik>
              </Box>
            );
          } else {
            return null;
          }
        })}
        {(questions.length === 0 || activeStep === questions.length + 1) && (
          <>
            <DialogContent dividers>
              {questions.length === 0 && (
                <Alert severity="warning">
                  {t(
                    'Weekly report questions have not been setup for your organization.',
                  )}
                </Alert>
              )}
              {questions.length > 0 && activeStep === questions.length + 1 && (
                <Alert severity="success">
                  {/* TODO: Translate success message */}
                  Your report was successfully submitted. View it on your
                  coaching reports page.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={localOnClose}>{t('Close')}</CancelButton>
            </DialogActions>
          </>
        )}
      </>
    </Modal>
  );
};
