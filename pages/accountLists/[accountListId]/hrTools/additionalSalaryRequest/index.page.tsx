import Head from 'next/head';
import React, { useState } from 'react';
import { FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { AdditionalSalaryRequest } from 'src/components/HrTools/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { InProgressDisplay } from 'src/components/HrTools/AdditionalSalaryRequest/MainPages/InProgress/InProgressDisplay';
import { IneligiblePage } from 'src/components/HrTools/AdditionalSalaryRequest/MainPages/IneligiblePage';
import { RequestPage } from 'src/components/HrTools/AdditionalSalaryRequest/RequestPage/RequestPage';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from 'src/components/HrTools/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
import { useAdditionalSalaryRequestForm } from 'src/components/HrTools/AdditionalSalaryRequest/Shared/useAdditionalSalaryRequestForm';
import { SavingStatus } from 'src/components/HrTools/Shared/CalculationReports/SavingStatus/SavingStatus';
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getAppName } from 'src/lib/getAppName';

const FormikRequestPage: React.FC = () => {
  const formik = useAdditionalSalaryRequestForm();

  return (
    <FormikProvider value={formik}>
      <RequestPage />
    </FormikProvider>
  );
};

const AdditionalSalaryRequestRouter: React.FC = () => {
  const { pageType, isNewAsr, requestData, loading, user } =
    useAdditionalSalaryRequest();

  const isEdit = pageType === PageEnum.Edit;

  if (loading) {
    return <Loading loading />;
  }

  if (user?.asrEit?.asrEligibility === false) {
    return <IneligiblePage />;
  }

  if (!requestData) {
    return <FormikRequestPage />;
  }

  switch (requestData.latestAdditionalSalaryRequest?.status) {
    case AsrStatusEnum.ActionRequired:
    case AsrStatusEnum.Pending:
    case AsrStatusEnum.PendingDivisionHeadApproval:
    case AsrStatusEnum.PendingVpApproval:
    case AsrStatusEnum.PendingManagementApproval:
    case AsrStatusEnum.PendingBoardApproval:
    case AsrStatusEnum.ApprovedNotPaid:
      // ActionRequired normally returns the <AdditionalSalaryRequest /> component accept when pageType is View or Edit
      return pageType === PageEnum.Edit || pageType === PageEnum.View ? (
        <FormikRequestPage />
      ) : (
        <AdditionalSalaryRequest />
      );
    case AsrStatusEnum.InProgress:
      return isEdit || isNewAsr ? <FormikRequestPage /> : <InProgressDisplay />;

    case AsrStatusEnum.ApprovedAndPaid:
    default:
      return <FormikRequestPage />;
  }
};

const AdditionalSalaryRequestContent: React.FC = () => {
  const [isNavListOpen, setNavListOpen] = useState(false);
  const { t } = useTranslation();

  const { requestData, loading, isMutating, pageType, currentIndex } =
    useAdditionalSalaryRequest();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const status = requestData?.latestAdditionalSalaryRequest?.status;

  const isFormPage = currentIndex === 1;

  const showStatuses: AsrStatusEnum[] = [
    AsrStatusEnum.ActionRequired,
    AsrStatusEnum.InProgress,
  ];
  const showSavingStatus =
    pageType !== PageEnum.View &&
    status &&
    showStatuses.includes(status) &&
    isFormPage;

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="salaryRequest"
          onClose={handleNavListToggle}
          navType={NavTypeEnum.HrTools}
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
            headerType={HeaderTypeEnum.HrTools}
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
  const appName = getAppName();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | Additional Salary Request')}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount
        requireUserGroups={RequiredUserGroupEnum.Asr}
      >
        <ReportPageWrapper>
          <AdditionalSalaryRequestProvider>
            <AdditionalSalaryRequestContent />
          </AdditionalSalaryRequestProvider>
        </ReportPageWrapper>
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default AdditionalSalaryRequestPage;
