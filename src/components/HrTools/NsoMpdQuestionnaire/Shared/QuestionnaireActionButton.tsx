import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface QuestionnaireActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined';
  children: React.ReactNode;
}

const StyledButton = styled(Button)(({ theme }) => ({
  paddingInline: theme.spacing(4),
  paddingBlock: theme.spacing(1),
  minWidth: theme.spacing(20),
  // On small screens the buttons stack into a column , so let
  // each one span the full width for larger, friendlier tap targets.
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

/**
 * Primary/secondary action button for the questionnaire (Continue / Back / Submit).
 */
export const QuestionnaireActionButton: React.FC<
  QuestionnaireActionButtonProps
> = ({ onClick, disabled, variant = 'contained', children }) => (
  <StyledButton
    variant={variant}
    size="large"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </StyledButton>
);
