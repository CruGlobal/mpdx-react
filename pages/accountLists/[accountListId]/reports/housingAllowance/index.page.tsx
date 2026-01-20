import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { DynamicExpensesClaim } from 'src/components/Reports/MinisterHousingAllowance/DynamicExpensesClaim/DynamicExpensesClaim';
import { MinisterHousingAllowanceReport } from 'src/components/Reports/MinisterHousingAllowance/MinisterHousingAllowance';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
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

interface MinisterHousingAllowanceContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

const MinisterHousingAllowanceContent: React.FC<
  MinisterHousingAllowanceContentProps
> = ({ isNavListOpen, onNavListToggle }) => {
  const { t } = useTranslation();
  const { isRightPanelOpen } = useMinisterHousingAllowance();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="housingAllowance"
          onClose={onNavListToggle}
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
            title={t("Minister's Housing Allowance Request")}
            headerType={HeaderTypeEnum.Report}
          />
          <MinisterHousingAllowanceReport />
        </>
      }
      rightPanel={isRightPanelOpen ? <DynamicExpensesClaim /> : undefined}
      rightOpen={isRightPanelOpen}
      rightWidth="35%"
    />
  );
};

const MinisterHousingAllowancePage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t("Reports - Minister's Housing Allowance")}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <ReportPageWrapper>
          <MinisterHousingAllowanceProvider>
            <MinisterHousingAllowanceContent
              isNavListOpen={isNavListOpen}
              onNavListToggle={handleNavListToggle}
            />
          </MinisterHousingAllowanceProvider>
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
