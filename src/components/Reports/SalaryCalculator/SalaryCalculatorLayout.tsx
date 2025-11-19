import { useRouter } from 'next/router';
import React from 'react';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { useTranslation } from 'react-i18next';
import { IconPanelLayout } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';

export interface SalaryCalculatorLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

export const SalaryCalculatorLayout: React.FC<SalaryCalculatorLayoutProps> = ({
  sectionListPanel,
  mainContent,
  isDrawerOpen,
  toggleDrawer,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { accountListId } = router.query;

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
      sidebarTitle={t('Form Steps')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Salary Calculator Sections')}
      mainContent={mainContent}
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
