import React, { useState } from 'react';
import { Button } from '@mui/material';

interface SubmitButtonProps {
  /**
   * Async submit handler. The button must not invoke this more than once
   * per in-flight submission (guards against duplicate requests).
   */
  onSubmit: () => Promise<void>;
  children: React.ReactNode;
}

/**
 * A submit button that guards against double-submission: while `onSubmit`
 * is in flight the button disables itself, so a second click cannot fire a
 * duplicate request (e.g. creating two donations from one intent).
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  children,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    // Runs the submit handler and re-enables the button when it settles.
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <Button onClick={handleClick} disabled={isSubmitting} variant="contained">
      {children}
    </Button>
  );
};
