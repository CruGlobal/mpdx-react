import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();

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
    <Typography sx={{ paddingInline: theme.spacing(4) }} variant="h5">
      {content[selectedSection]}
    </Typography>
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
