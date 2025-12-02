import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { AboutForm } from './AboutForm/AboutForm';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { SectionPage } from './SharedComponents/SectionPage';

export const MainContent: React.FC = () => {
  const { currentStep } = useAdditionalSalaryRequest();
  const { t } = useTranslation();

  switch (currentStep) {
    case AdditionalSalaryRequestSectionEnum.AboutForm:
      return <AboutForm />;
    case AdditionalSalaryRequestSectionEnum.CompleteForm:
      return <CompleteForm />;
    case AdditionalSalaryRequestSectionEnum.Receipt:
      return <Typography variant="h5">{t('Receipt content')}</Typography>;
  }
};

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isDrawerOpen, toggleDrawer, percentComplete } =
    useAdditionalSalaryRequest();

  const iconPanelItems = [
    {
      key: 'toggle',
      icon: isDrawerOpen ? <MenuOpenSharp /> : <MenuSharp />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return (
    <IconPanelLayout
      percentComplete={percentComplete}
      iconPanelItems={iconPanelItems}
      sidebarContent={<SectionList />}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={
        <SectionPage>
          <MainContent />
        </SectionPage>
      }
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
