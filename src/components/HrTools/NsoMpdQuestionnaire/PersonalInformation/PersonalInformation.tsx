import React, { useEffect } from 'react';
import { Box, Divider } from '@mui/material';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { Settings } from './Settings';
import { StaffInformation } from './StaffInformation';

/**
 * Review-only step: staff data is shown for verification, with nothing to fill in.
 */
const RegisterReviewStepValid: React.FC = () => {
  const { markValid } = useOptionalAutosaveForm() ?? {};

  useEffect(() => {
    markValid?.('personal-information');
    return () => markValid?.('personal-information');
  }, [markValid]);

  return null;
};

export const PersonalInformation: React.FC = () => {
  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <RegisterReviewStepValid />
        <Settings />
        <Divider sx={{ mx: -4, my: 4 }} />
        <StaffInformation />
        <Divider sx={{ mx: -4, mt: 4 }} />
      </Box>
    </NsoMpdQuestionnaireLayout>
  );
};
