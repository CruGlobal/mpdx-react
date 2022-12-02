import React from 'react';
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
    },
    {
      question: t('What has been encouraging in MPD this past week?'),
    },
    {
      question: t('What has been discouraging in MPD this past week?'),
    },
    {
      question: t(
        'What is one thing you will definitely prioritize next in MPD?',
      ),
    },
    {
      question: t('How can I be praying for you?'),
    },
  ];

  const errorFlag = questions.length === 0 || setupError;

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={onClose}>
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
          onSubmit={onClose}
        >
          {({ values, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent dividers>
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
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
                  {/* TODO: Integrate questions from production */}
                  <Box mt={1}>
                    <WeeklyReportRadio
                      question={questions[0].question}
                      options={questions[0].options}
                      value={values.q1}
                      name="q1"
                      show={activeStep === 1}
                    />
                    <WeeklyReportRadio
                      question={questions[1].question}
                      options={questions[1].options}
                      value={values.q2}
                      name="q2"
                      show={activeStep === 2}
                    />
                    <WeeklyReportRadio
                      question={questions[2].question}
                      options={questions[2].options}
                      value={values.q3}
                      name="q3"
                      show={activeStep === 3}
                    />
                    <WeeklyReportTextField
                      question={questions[3].question}
                      value={values.q4}
                      name="q4"
                      show={activeStep === 4}
                    />
                    <WeeklyReportTextField
                      question={questions[4].question}
                      value={values.q5}
                      name="q5"
                      show={activeStep === 5}
                    />
                    <WeeklyReportTextField
                      question={questions[5].question}
                      value={values.q6}
                      name="q6"
                      show={activeStep === 6}
                    />
                    <WeeklyReportTextField
                      question={questions[6].question}
                      value={values.q7}
                      name="q7"
                      show={activeStep === 7}
                    />
                    <WeeklyReportTextField
                      question={questions[7].question}
                      value={values.q8}
                      name="q8"
                      show={activeStep === 8}
                    />
                  </Box>
                </>
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent:
                    activeStep === 1 ? 'flex-end' : 'space-between',
                }}
              >
                {activeStep >= 2 && (
                  <CancelButton onClick={onPrev}>{t('Back')}</CancelButton>
                )}
                {activeStep < questions.length && (
                  <SubmitButton type="button" onClick={onNext}>
                    {t('Next')}
                  </SubmitButton>
                )}
                {activeStep === questions.length && (
                  <SubmitButton type="submit">{t('Submit')}</SubmitButton>
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
