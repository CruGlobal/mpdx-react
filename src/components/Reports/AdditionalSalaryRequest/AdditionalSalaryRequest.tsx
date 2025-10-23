import React from 'react';
import { Box, Typography } from '@mui/material';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestLayout } from './Shared/AdditionalSalaryRequestLayout';
import { SectionList } from './Shared/SectionList';

const MainContent: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();

  const content = {
    [AdditionalSalaryRequestSectionEnum.AboutForm]: 'About this Form content',
    [AdditionalSalaryRequestSectionEnum.CompleteForm]: 'Complete Form content',
    [AdditionalSalaryRequestSectionEnum.Receipt]: 'Receipt content',
  };

  return (
    <Box sx={{ px: 4 }}>
      <Typography variant="h5">{content[selectedSection]}</Typography>
    </Box>
  );
};

export const AdditionalSalaryRequest: React.FC = () => {
  return (
    <AdditionalSalaryRequestProvider>
      <AdditionalSalaryRequestLayout
        sectionListPanel={<SectionList />}
        mainContent={<MainContent />}
      />
    </AdditionalSalaryRequestProvider>
  );
};
