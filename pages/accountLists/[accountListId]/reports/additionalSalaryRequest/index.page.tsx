import Head from 'next/head';
import React, { useState } from 'react';
import { FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { InProgressDisplay } from 'src/components/Reports/AdditionalSalaryRequest/MainPages/InProgress/InProgressDisplay';
import { IneligiblePage } from 'src/components/Reports/AdditionalSalaryRequest/MainPages/IneligiblePage';
import { OverviewPage } from 'src/components/Reports/AdditionalSalaryRequest/MainPages/OverviewPage';
import { RequestPage } from 'src/components/Reports/AdditionalSalaryRequest/RequestPage/RequestPage';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import { useAdditionalSalaryRequestForm } from 'src/components/Reports/AdditionalSalaryRequest/Shared/useAdditionalSalaryRequestForm';
import { SavingStatus } from 'src/components/Reports/Shared/CalculationReports/SavingStatus/SavingStatus';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
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
import { AsrStatusEnum } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

// TODO: Revert comments on this page

const FormikRequestPage: React.FC = () => {
  const formik = useAdditionalSalaryRequestForm();

  return (
    <FormikProvider value={formik}>
      <RequestPage />
    </FormikProvider>
  );
};

type RouteType = 'ineligible' | 'overview' | 'continue' | 'request';

const useCurrentRoute = (): RouteType | null => {
  const { requestData, loading } = useAdditionalSalaryRequest();

  // if (user?.asrEit?.asrEligibility === false) {
  //   return 'ineligible';
  // }

  if (loading) {
    return null;
  }

  if (!requestData) {
    return 'request';
  }

  switch (requestData.latestAdditionalSalaryRequest?.status) {
    case AsrStatusEnum.ActionRequired:
    case AsrStatusEnum.Pending:
      return 'overview';
    case AsrStatusEnum.InProgress:
      return 'continue';
    case AsrStatusEnum.Approved:
    default:
      return 'request';
  }
};

const AdditionalSalaryRequestRouter: React.FC = () => {
  const currentRoute = useCurrentRoute();
  const { pageType } = useAdditionalSalaryRequest();

  const isEdit = pageType === PageEnum.Edit;

  if (!currentRoute) {
    return <Loading loading />;
  }

  switch (currentRoute) {
    case 'ineligible':
      return <IneligiblePage />;
    case 'overview':
      return <OverviewPage />;
    case 'continue':
      return isEdit ? <FormikRequestPage /> : <InProgressDisplay />;
    case 'request':
      return <FormikRequestPage />;
  }
};

const AdditionalSalaryRequestContent: React.FC = () => {
  const [isNavListOpen, setNavListOpen] = useState(false);
  const { t } = useTranslation();

  const { requestData, loading, isMutating, pageType, user } =
    useAdditionalSalaryRequest();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const status = requestData?.latestAdditionalSalaryRequest?.status;
  const showStatuses: AsrStatusEnum[] = [
    AsrStatusEnum.ActionRequired,
    AsrStatusEnum.Pending,
  ];
  const showSavingStatus =
    pageType !== PageEnum.View &&
    (!status || showStatuses.includes(status)) &&
    user?.asrEit?.asrEligibility !== false;

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="salaryRequest"
          onClose={handleNavListToggle}
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
            rightExtra={
              showSavingStatus && (
                <SavingStatus
                  loading={loading}
                  hasData={!!requestData}
                  isMutating={isMutating}
                  lastSavedAt={
                    requestData?.latestAdditionalSalaryRequest?.updatedAt ??
                    null
                  }
                />
              )
            }
          />
          <AdditionalSalaryRequestRouter />
        </>
      }
    />
  );
};

const AdditionalSalaryRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Additional Salary Request')}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <ReportPageWrapper>
          <AdditionalSalaryRequestProvider>
            <AdditionalSalaryRequestContent />
          </AdditionalSalaryRequestProvider>
        </ReportPageWrapper>
      ) : loading ? (
        <Loading loading />
      ) : (
        <NoStaffAccount />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default AdditionalSalaryRequestPage;
