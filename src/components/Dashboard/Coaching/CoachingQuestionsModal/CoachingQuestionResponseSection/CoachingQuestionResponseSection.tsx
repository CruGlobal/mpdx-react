import React, { ChangeEvent, useRef, useEffect } from 'react';
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

interface Props {
  questionPrompt: string;
  responseOptions: string[] | null;
  selectedResponseValue: string | null;
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
  questionPrompt,
  responseOptions,
  selectedResponseValue,
  onResponseChanged,
}) => {
  const textInput = useRef<HTMLInputElement>(null);
  const radioInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (selectedResponseValue === null) {
        clearForm();
      }
    };
  }, [selectedResponseValue]);

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

  const clearForm = () => {
    if (textInput.current !== null) {
      textInput.current.value = '';
    }
    if (radioInput.current !== null) {
      radioInput.current.value = '';
    }
  };

  const renderResponseOption = (option: string) => {
    const value = responseOptions?.indexOf(option).toString();

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
      <PromptText>{questionPrompt}</PromptText>
      {responseOptions !== null ? (
        <FormControl>
          <RadioGroup
            aria-label="responseOptions"
            name="responseOptions"
            value={selectedResponseValue}
            onChange={onFormControlChange}
            row
          >
            {responseOptions?.map(renderResponseOption)}
          </RadioGroup>
        </FormControl>
      ) : (
        <ShortAnswer
          multiline
          rows={4}
          variant="outlined"
          onChange={onTextFieldChange}
          inputRef={textInput}
        />
      )}
    </Box>
  );
};

export default CoachingQuestionResponseSection;
