import React from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  overflowX: 'auto',
  paddingBottom: theme.spacing(0.5),
  scrollbarWidth: 'thin',
}));

const Starter = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  borderRadius: 999,
  textTransform: 'none',
  color: theme.palette.text.primary,
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
}));

interface StarterQuestionsProps {
  disabled: boolean;
  onPick: (question: string) => void;
}

export const StarterQuestions: React.FC<StarterQuestionsProps> = ({
  disabled,
  onPick,
}) => {
  const { t } = useTranslation();
  const questions = [
    t('How do I add a task?'),
    t('How do I add a contact?'),
    t('What is a commitment?'),
    t('How do I log a gift?'),
  ];

  return (
    <Row role="group" aria-label={t('Suggested questions')}>
      {questions.map((question) => (
        <Starter
          key={question}
          variant="outlined"
          size="small"
          disabled={disabled}
          onClick={() => onPick(question)}
        >
          {question}
        </Starter>
      ))}
    </Row>
  );
};
