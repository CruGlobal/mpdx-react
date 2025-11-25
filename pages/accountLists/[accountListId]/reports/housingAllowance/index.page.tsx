import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { MinisterHousingAllowanceReport } from 'src/components/Reports/MinisterHousingAllowance/MinisterHousingAllowance';
import { mocks } from 'src/components/Reports/MinisterHousingAllowance/Shared/mockData';
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

const MinisterHousingAllowancePage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  // mock[0] --> Single, no pending, no approved
  // mock[1] --> Married, no pending, no approved
  // mock[2] --> Married, no pending, approved
  // mock[3] --> Single, no pending, approved
  // mock[4] --> Married, pending, no approved

  return (
    <>
      <Head>
        <title>{`${appName} | ${t("Reports - Minister's Housing Allowance")}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <ReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="housingAllowance"
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
                  title={t("Minister's Housing Allowance Request")}
                  headerType={HeaderTypeEnum.Report}
                />
                <MinisterHousingAllowanceReport testPerson={mocks[4]} />
              </>
            }
          />
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

export default MinisterHousingAllowancePage;
