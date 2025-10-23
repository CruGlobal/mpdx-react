import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestLayout } from './Shared/AdditionalSalaryRequestLayout';
import { SectionList } from './Shared/SectionList';

const MainContent: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();

  const content = {
    [AdditionalSalaryRequestSectionEnum.AboutForm]: t(
      'About this Form content',
    ),
    [AdditionalSalaryRequestSectionEnum.CompleteForm]: t(
      'Complete Form content',
    ),
    [AdditionalSalaryRequestSectionEnum.Receipt]: t('Receipt content'),
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
