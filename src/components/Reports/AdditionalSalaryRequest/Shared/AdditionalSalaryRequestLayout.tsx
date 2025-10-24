import { useRouter } from 'next/router';
import React from 'react';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { useTranslation } from 'react-i18next';
import { IconPanelLayout } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

interface AdditionalSalaryRequestLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

export const AdditionalSalaryRequestLayout: React.FC<
  AdditionalSalaryRequestLayoutProps
> = ({ sectionListPanel, mainContent }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { accountListId } = router.query;
  const { isDrawerOpen, toggleDrawer } = useAdditionalSalaryRequest();

  const iconPanelItems = [
    {
      icon: isDrawerOpen ? <MenuOpenSharp /> : <MenuSharp />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return (
    <IconPanelLayout
      percentComplete={50}
      iconPanelItems={iconPanelItems}
      sidebarContent={sectionListPanel}
      sidebarTitle={t('Additional Salary Request')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Additional Salary Request Sections')}
      mainContent={mainContent}
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
