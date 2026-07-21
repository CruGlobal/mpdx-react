import React from 'react';
import { Box, Divider } from '@mui/material';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { Settings } from './Settings';
import { StaffInformation } from './StaffInformation';

export const PersonalInformation: React.FC = () => {
  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <Settings />
        <Divider sx={{ mx: -4, my: 4 }} />
        <StaffInformation />
        <Divider sx={{ mx: -4, mt: 4 }} />
      </Box>
    </NsoMpdQuestionnaireLayout>
  );
};
