import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { AdditionalSalaryRequest } from 'src/components/Reports/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { AdditionalSalaryRequestProvider } from 'src/components/Reports/AdditionalSalaryRequest/Shared/AdditionalSalaryRequestContext';
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
import useGetAppSettings from 'src/hooks/useGetAppSettings';

interface AdditionalSalaryRequestContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  designationAccounts: string[];
  setDesignationAccounts: (accounts: string[]) => void;
}

const AdditionalSalaryRequestContent: React.FC<
  AdditionalSalaryRequestContentProps
> = ({
  isNavListOpen,
  onNavListToggle,
  designationAccounts,
  setDesignationAccounts,
}) => {
  const { t } = useTranslation();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="salaryRequest"
          onClose={onNavListToggle}
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
            onNavListToggle={onNavListToggle}
            title={t('Additional Salary Request')}
            headerType={HeaderTypeEnum.Report}
          />
          <AdditionalSalaryRequest />
        </>
      }
    />
  );
};

const AdditionalSalaryRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Additional Salary Request')}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <ReportPageWrapper>
          <AdditionalSalaryRequestProvider>
            <AdditionalSalaryRequestContent
              isNavListOpen={isNavListOpen}
              onNavListToggle={handleNavListToggle}
              designationAccounts={designationAccounts}
              setDesignationAccounts={setDesignationAccounts}
            />
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
