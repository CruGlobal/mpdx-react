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
import { Formik } from 'formik';
import { useOrganizationId } from 'src/hooks/useOrganizationId';
import { ElementOf } from 'ts-essentials';

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
  const setupError = false;

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
  const errorFlag = questions.length === 0 || setupError;
  const [success, setSuccess] = useState<boolean>(false);

  // Lookup the answer for a question
  const getAnswer = (
    questionId: string,
  ): ElementOf<
    CurrentCoachingAnswerSetQuery['currentCoachingAnswerSet']['answers']
  > | null =>
    answers.find((answer) => answer.question.id === questionId) ?? null;

  const initialValues = Object.fromEntries(
    questions.map(({ id }) => [id, getAnswer(id)?.response ?? '']),
  );

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

  const handleSuccess = () => {
    setSuccess(true);
    handleWeeklyReportNext();
  };

  const localOnClose = () => {
    onClose();
    setSuccess(false);
    setTimeout(() => {
      setActiveStep(1);
    }, 1000);
  };

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={localOnClose}>
      {!errorFlag ? (
        <Formik initialValues={initialValues} onSubmit={handleSuccess}>
          {({ values, setFieldValue, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent dividers>
                <>
                  {activeStep <= questions.length && (
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
                          value={(activeStep / questions.length) * 100}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >{`${activeStep}/${questions.length}`}</Typography>
                      </Box>
                    </Box>
                  )}
                  <Box>
                    {questions.map((question, index) => {
                      const answerId = getAnswer(question.id)?.id ?? null;
                      if (
                        question.responseOptions &&
                        question.responseOptions.length > 0
                      )
                        return (
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
                              setFieldValue(question.id, event.target.value);
                            }}
                            show={activeStep === index + 1}
                          />
                        );
                      else {
                        return (
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
                        );
                      }
                    })}
                    {success && ( // TODO: Translate success message
                      <Alert severity="success">
                        Your report was successfully submitted. View it on your
                        coaching reports page.
                      </Alert>
                    )}
                  </Box>
                </>
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent:
                    activeStep === 1 || activeStep === questions.length + 1
                      ? 'flex-end'
                      : 'space-between',
                }}
              >
                {activeStep > 1 && activeStep < questions.length + 1 && (
                  <CancelButton onClick={handleWeeklyReportPrev}>
                    {t('Back')}
                  </CancelButton>
                )}
                {activeStep === questions.length + 1 && (
                  <CancelButton onClick={localOnClose}>
                    {t('Close')}
                  </CancelButton>
                )}
                {activeStep < questions.length && ( // TODO: Disable button when currently visible field has no value
                  <SubmitButton type="button" onClick={handleWeeklyReportNext}>
                    {t('Next')}
                  </SubmitButton>
                )}
                {activeStep === questions.length && ( // TODO: Disable button when currently visible field has no value or isSubmitting
                  <SubmitButton type="submit" disabled={isSubmitting} />
                )}
              </DialogActions>
            </form>
          )}
        </Formik>
      ) : (
        <>
          <DialogContent dividers>
            <Alert severity="warning">
              {setupError
                ? t(
                    'Weekly report questions have not been setup for your organization.',
                  )
                : null}
              {!setupError && questions?.length === 0
                ? t('No questions have been created') // TODO: Get real error message
                : null}
            </Alert>
          </DialogContent>
          <DialogActions>
            <CancelButton onClick={localOnClose} />
          </DialogActions>
        </>
      )}
    </Modal>
  );
};
