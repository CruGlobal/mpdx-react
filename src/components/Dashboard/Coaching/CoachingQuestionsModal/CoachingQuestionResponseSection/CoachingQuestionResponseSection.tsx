import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { FormQuestionFragment } from '../../GetCoachingAnswerSets.generated';

interface Props {
  question: FormQuestionFragment;
  onResponseChanged: (response: string) => void;
}

const PromptText = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  flex: 1,
  marginHorizontal: 24,
}));

const ResponseOption = styled(FormControlLabel)(({}) => ({
  margin: 12,
}));

const ShortAnswer = styled(TextField)(({}) => ({
  display: 'flex',
  flex: 1,
  margin: 12,
}));

const CoachingQuestionResponseSection: React.FC<Props> = ({
  question,
  onResponseChanged,
}) => {
  const { t } = useTranslation();

  const { prompt, responseOptions } = question;

  const [responseValue, setResponseValue] = useState<string>();

  const onFormControlChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setResponseValue(value);
    onResponseChanged(value);
  };

  const onTextFieldChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setResponseValue(value);
    onResponseChanged(value);
  };

  const renderResponseOption = (option: string) => {
    const value = question.responseOptions?.indexOf(option).toString();

    return (
      <ResponseOption
        key={value}
        value={value}
        label={option}
        control={<Radio />}
      />
    );
  };

  return (
    <Box>
      <PromptText>{prompt}</PromptText>
      {responseOptions !== null ? (
        <FormControl>
          <RadioGroup
            aria-label="responseOptions"
            name="responseOptions"
            value={responseValue}
            onChange={onFormControlChange}
            row
          >
            {question.responseOptions?.map(renderResponseOption)}
          </RadioGroup>
        </FormControl>
      ) : (
        <ShortAnswer
          multiline
          rows={4}
          variant="outlined"
          placeholder={t('Response')}
          onChange={onTextFieldChange}
        />
      )}
    </Box>
  );
};

export default CoachingQuestionResponseSection;
