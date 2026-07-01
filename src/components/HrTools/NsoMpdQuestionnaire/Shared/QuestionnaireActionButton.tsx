import React from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface QuestionnaireActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const StyledButton = styled(Button)(({ theme }) => ({
  paddingInline: theme.spacing(4),
  paddingBlock: theme.spacing(1),
  minWidth: theme.spacing(20),
}));

/**
 * Primary action button for the questionnaire (Continue / Submit), wrapped in its own spacing
 * container so callers don't repeat the layout Box.
 */
export const QuestionnaireActionButton: React.FC<
  QuestionnaireActionButtonProps
> = ({ onClick, disabled, children }) => (
  <Box mx={4}>
    <StyledButton
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  </Box>
);
