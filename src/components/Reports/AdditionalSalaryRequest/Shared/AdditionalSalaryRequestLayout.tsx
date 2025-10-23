import { useRouter } from 'next/router';
import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
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
  const { isDrawerOpen, toggleDrawer, loading } = useAdditionalSalaryRequest();

  if (loading) {
    return <Loading loading />;
  }

  const iconPanelItems = [
    {
      icon: <MenuIcon />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return (
    <IconPanelLayout
      // modify percent when we have state
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
