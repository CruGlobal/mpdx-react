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
import { CoachingQuestion } from '../../../../../../graphql/types.generated';

interface Props {
  question: CoachingQuestion;
  onResponseChanged: (response: string) => void;
}

const PromptText = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  flex: 1,
  marginHorizontal: 24,
}));

const ShortAnswer = styled(TextField)(({}) => ({
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
          >
            {question.responseOptions?.map((option) => (
              <FormControlLabel
                key={question.responseOptions?.indexOf(option)}
                value={question.responseOptions?.indexOf(option)}
                label={option}
                control={<Radio />}
              />
            ))}
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
