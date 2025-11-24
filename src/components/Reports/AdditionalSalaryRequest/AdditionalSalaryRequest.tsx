import React from 'react';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IconPanelLayout } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { AboutForm } from './AboutForm/AboutForm';
import { AdditionalSalaryRequestSectionEnum } from './AdditionalSalaryRequestHelper';
import { CompleteForm } from './CompleteForm/CompleteForm';
import { useAdditionalSalaryRequest } from './Shared/AdditionalSalaryRequestContext';
import { SectionList } from './Shared/SectionList';
import { SectionPage } from './SharedComponents/SectionPage';

export const MainContent: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();

  switch (selectedSection.section) {
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
  const { isDrawerOpen, toggleDrawer } = useAdditionalSalaryRequest();

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
      percentComplete={50}
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
