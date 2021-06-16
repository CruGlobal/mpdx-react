import React, { ChangeEvent, useEffect, useRef } from 'react';
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
import { FormQuestionFragment } from '../../GetCoachingAnswerSets.generated';

interface Props {
  questionIndex: number;
  responseValue: string | null;
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
  questionIndex,
  responseValue,
  question,
  onResponseChanged,
}) => {
  const textField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    debugger;
    if (textField.current) {
      debugger;
      textField.current.value = responseValue || '';
    }
  }, [questionIndex]);

  const onFormControlChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    onResponseChanged(value);
  };

  const onTextFieldChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
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
      <PromptText>{question.prompt}</PromptText>
      {!!question.responseOptions ? (
        <FormControl>
          <RadioGroup
            aria-label="responseOptions"
            name="responseOptions"
            onChange={onFormControlChange}
            row
          >
            {question.responseOptions.map(renderResponseOption)}
          </RadioGroup>
        </FormControl>
      ) : (
        <ShortAnswer
          multiline
          rows={4}
          variant="outlined"
          onChange={onTextFieldChange}
          ref={textField}
        />
      )}
    </Box>
  );
};

export default CoachingQuestionResponseSection;
