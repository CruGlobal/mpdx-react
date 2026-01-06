import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { RequestPage } from 'src/components/Reports/AdditionalSalaryRequest/RequestPage/RequestPage';
import { AdditionalSalaryRequestProvider } from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const AdditionalSalaryRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const { requestId, mode } = router.query;

  const getPageType = (mode: string | string[] | undefined) => {
    switch (mode) {
      case 'new':
        return PageEnum.New;
      case 'edit':
        return PageEnum.Edit;
      case 'view':
        return PageEnum.View;
      default:
        return undefined;
    }
  };

  const pageType = getPageType(mode);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Additional Salary Request')}`}</title>
      </Head>
      <ReportPageWrapper>
        <AdditionalSalaryRequestProvider
          requestId={requestId as string}
          type={pageType}
        >
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="salaryRequest"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            headerHeight={multiPageHeaderHeight}
            mainContent={
              <>
                <MultiPageHeader
                  isNavListOpen={isNavListOpen}
                  onNavListToggle={handleNavListToggle}
                  title={t('Additional Salary Request')}
                  headerType={HeaderTypeEnum.Report}
                />
                <RequestPage />
              </>
            }
          />
        </AdditionalSalaryRequestProvider>
      </ReportPageWrapper>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default AdditionalSalaryRequestPage;
