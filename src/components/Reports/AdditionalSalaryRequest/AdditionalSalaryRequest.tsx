import React from 'react';
import { Typography } from '@mui/material';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { SalaryRequestForm } from './SalaryRequestForm/SalaryRequestForm';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from './Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestLayout } from './Shared/AdditionalSalaryRequestLayout';
import { SectionList } from './Shared/SectionList';

const MainContent: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();

  switch (selectedSection) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return <Typography variant="h5">About this Form content</Typography>;
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return <SalaryRequestForm />;
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return <Typography variant="h5">Receipt content</Typography>;
  }
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
