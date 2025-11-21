import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';

export const MainContent: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();

  switch (selectedSection) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return (
        <Typography variant="h5">{t('About this Form content')}</Typography>
      );
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return <CompleteForm />;
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return <Typography variant="h5">{t('Receipt content')}</Typography>;
  }
};

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isDrawerOpen, toggleDrawer } = useAdditionalSalaryRequest();

  const { steps } = useAdditionalSalaryRequest();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={50}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      sidebarContent={<StepsList steps={steps} />}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
