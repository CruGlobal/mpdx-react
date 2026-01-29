import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { RequestPage } from 'src/components/Reports/AdditionalSalaryRequest/RequestPage/RequestPage';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import { SavingStatus } from 'src/components/Reports/AdditionalSalaryRequest/Shared/SavingStatus/SavingStatus';
import { useAdditionalSalaryRequestForm } from 'src/components/Reports/AdditionalSalaryRequest/Shared/useAdditionalSalaryRequestForm';
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

const RequestPageContent: React.FC<{ requestId: string }> = ({ requestId }) => {
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const { t } = useTranslation();

  const formik = useAdditionalSalaryRequestForm({ requestId });
  const { pageType } = useAdditionalSalaryRequest();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <FormikProvider value={formik}>
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
              rightExtra={pageType !== PageEnum.View && <SavingStatus />}
            />
            <RequestPage />
          </>
        }
      />
    </FormikProvider>
  );
};

const AdditionalSalaryRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { appName } = useGetAppSettings();

  const { requestId } = router.query;

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Additional Salary Request')}`}</title>
      </Head>
      <ReportPageWrapper>
        <AdditionalSalaryRequestProvider requestId={requestId as string}>
          {requestId && <RequestPageContent requestId={requestId as string} />}
        </AdditionalSalaryRequestProvider>
      </ReportPageWrapper>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default AdditionalSalaryRequestPage;
