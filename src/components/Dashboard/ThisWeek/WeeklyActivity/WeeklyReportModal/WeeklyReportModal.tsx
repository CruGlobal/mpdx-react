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

  const handleSubmit = () => {
    onClose();
  };

  const questions = [
    {
      question: t('How many hours this week did you spend on MPD?'),
      type: 'radio',
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
      type: 'radio',
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
      type: 'radio',
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
      type: 'textarea',
    },
    {
      question: t('What has been encouraging in MPD this past week?'),
      type: 'textarea',
    },
    {
      question: t('What has been discouraging in MPD this past week?'),
      type: 'textarea',
    },
    {
      question: t(
        'What is one thing you will definitely prioritize next in MPD?',
      ),
      type: 'textarea',
    },
    {
      question: t('How can I be praying for you?'),
      type: 'textarea',
    },
  ];

  const errorFlag = questions.length === 0 || setupError;

  return (
    <Modal isOpen={open} title={t('Weekly Report')} handleClose={onClose}>
      {!errorFlag ? (
        <form>
          <DialogContent dividers>
            {setupError ? (
              <Alert severity="warning">
                {t(
                  'Weekly report questions have not been setup for your organization.',
                )}
              </Alert>
            ) : (
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
                {questions.map((question, i) => {
                  if (activeStep === i + 1) {
                    return (
                      <Box mt={1} key={question.question}>
                        {question.type === 'radio' && question.options && (
                          <FormControl>
                            <FormLabel sx={labelStyles}>
                              {question.question}
                            </FormLabel>
                            <RadioGroup
                              defaultValue={question.options[0].label}
                              name={`radio-group-${i}`}
                              row
                            >
                              {question.options.map((option) => (
                                <FormControlLabel
                                  key={option.value}
                                  value={option.value}
                                  control={<Radio />}
                                  label={option.label}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        )}
                        {question.type === 'textarea' && (
                          <TextField
                            rows={3}
                            label={question.question}
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
                        )}
                      </Box>
                    );
                  } else {
                    return null;
                  }
                })}
              </>
            )}
          </DialogContent>
          {!setupError && (
            <DialogActions
              sx={{
                justifyContent: activeStep === 1 ? 'flex-end' : 'space-between',
              }}
            >
              {activeStep >= 2 && (
                <CancelButton onClick={onPrev}>{t('Back')}</CancelButton>
              )}
              <SubmitButton
                type={'button'} // TODO: change type to 'submit' on last screen
                onClick={activeStep < questions.length ? onNext : handleSubmit}
              >
                {activeStep < questions.length ? t('Next') : t('Submit')}
              </SubmitButton>
            </DialogActions>
          )}
        </form>
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
