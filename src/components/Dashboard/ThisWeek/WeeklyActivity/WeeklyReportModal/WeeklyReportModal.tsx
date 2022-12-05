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
import Modal from '../../../../common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../../../theme';
import { Formik } from 'formik';

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

const WeeklyReportRadio = ({ question, options, value, name, show }) => (
  <FormControl sx={{ display: show ? 'inline-flex' : 'none' }}>
    <FormLabel sx={labelStyles}>{question}</FormLabel>
    <RadioGroup defaultValue={value} name={name} row>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

const WeeklyReportTextField = ({ question, value, name, show }) => (
  <TextField
    sx={{ display: show ? 'inline-flex' : 'none' }}
    defaultValue={value}
    name={name}
    rows={3}
    label={question}
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
  open: boolean;
  onClose: () => void;
  activeStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export const WeeklyReportModal = ({
  open,
  onClose,
  activeStep,
  onPrev,
  onNext,
}: WeeklyReportModalProps) => {
  const { t } = useTranslation();
  const setupError = false;

  // TODO: Integrate questions from production
  const questions = [
    {
      question: t('How many hours this week did you spend on MPD?'),
      options: [
        {
          label: '0 - 9',
          value: '0 - 9',
        },
        {
          label: '10 - 19',
          value: '10 - 19',
        },
        {
          label: '20 - 29',
          value: '20 - 29',
        },
        {
          label: '30 - 39',
          value: '30 - 39',
        },
        {
          label: t('40 or more'),
          value: '40 or more',
        },
      ],
    },
    {
      question: t('How is your current financial situation?'),
      options: [
        {
          label: t('not enough money to pay bills'),
          value: 'not enough money to pay bills',
        },
        {
          label: t('just enough for basics'),
          value: 'just enough for basics',
        },
        {
          label: t('more than enough'),
          value: 'more than enough',
        },
      ],
    },
    {
      question: t('How is your time with the Lord?'),
      options: [
        {
          label: t('feeling distant'),
          value: 'feeling distant',
        },
        {
          label: t('connecting with God most days'),
          value: 'connecting with God most days',
        },
        {
          label: t('robust time with God'),
          value: 'robust time with God',
        },
      ],
    },
    {
      question: t(
        'In addition to calls/texts/appointments, what other MPD work did you do this week?',
      ),
      options: [],
    },
    {
      question: t('What has been encouraging in MPD this past week?'),
      options: [],
    },
    {
      question: t('What has been discouraging in MPD this past week?'),
      options: [],
    },
    {
      question: t(
        'What is one thing you will definitely prioritize next in MPD?',
      ),
      options: [],
    },
    {
      question: t('How can I be praying for you?'),
      options: [],
    },
  ];

  const errorFlag = questions.length === 0 || setupError;
  const [success, setSucces] = useState(false);

  const handleSuccess = () => {
    setSucces(true);
    onNext();
  };

  return (
    <Modal
      isOpen={open}
      title={t('Weekly Report')}
      handleClose={() => {
        onClose();
        setSucces(false);
      }}
    >
      {!errorFlag ? (
        <Formik
          initialValues={{
            q1: '',
            q2: '',
            q3: '',
            q4: '',
            q5: '',
            q6: '',
            q7: '',
            q8: '',
          }}
          onSubmit={handleSuccess}
        >
          {({ values, handleSubmit, isSubmitting }) => (
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
                    {questions.map((question, i) => {
                      if (question.options.length > 0) {
                        return (
                          <WeeklyReportRadio
                            key={i}
                            question={question.question}
                            options={question.options}
                            value={values['q' + (i + 1)]}
                            name={`q${i + 1}`}
                            show={activeStep === i + 1}
                          />
                        );
                      } else {
                        return (
                          <WeeklyReportTextField
                            key={i}
                            question={question.question}
                            value={values['q' + (i + 1)]}
                            name={`q${i + 1}`}
                            show={activeStep === i + 1}
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
                  <CancelButton onClick={onPrev}>{t('Back')}</CancelButton>
                )}
                {activeStep === questions.length + 1 && (
                  <CancelButton
                    onClick={() => {
                      onClose();
                      setSucces(false);
                    }}
                  >
                    {t('Close')}
                  </CancelButton>
                )}
                {activeStep < questions.length && ( // TODO: Disable button when currently visible field has no value
                  <SubmitButton type="button" onClick={onNext}>
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
              {!setupError && questions.length === 0
                ? t('No questions have been created') // TODO: Get real error message
                : null}
            </Alert>
          </DialogContent>
          <DialogActions>
            <CancelButton onClick={onClose} />
          </DialogActions>
        </>
      )}
    </Modal>
  );
};
