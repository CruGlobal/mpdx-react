import Head from 'next/head';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { GoalCalculator } from 'src/components/Reports/GoalCalculator/GoalCalculator';
import {
  GoalCalculatorProvider,
  useGoalCalculator,
} from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
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
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const RightPanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
}));

const RightPanelTitle = styled(Typography)({
  fontSize: '0.875rem',
});

const RightPanelContent = styled('div')(({ theme }) => ({
  margin: theme.spacing(2),
}));

interface GoalCalculatorContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  designationAccounts: string[];
  setDesignationAccounts: (accounts: string[]) => void;
}

const GoalCalculatorContent: React.FC<GoalCalculatorContentProps> = ({
  isNavListOpen,
  onNavListToggle,
  designationAccounts,
  setDesignationAccounts,
}) => {
  const { rightPanelContent, closeRightPanel } = useGoalCalculator();
  const { t } = useTranslation();

  const rightPanel = (
    <>
      <RightPanelHeader>
        <RightPanelTitle variant="h6">{t('Details')}</RightPanelTitle>
        <IconButton
          size="small"
          onClick={closeRightPanel}
          aria-label={t('Close Panel')}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </RightPanelHeader>
      <RightPanelContent>{rightPanelContent}</RightPanelContent>
    </>
  );

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="goalCalculation"
          onClose={onNavListToggle}
          designationAccounts={designationAccounts}
          setDesignationAccounts={setDesignationAccounts}
          navType={NavTypeEnum.Reports}
        />
      }
      leftOpen={isNavListOpen}
      leftWidth="290px"
      rightWidth="600px"
      headerHeight={multiPageHeaderHeight}
      mainContent={
        <>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            title={t('Goal Calculator')}
            headerType={HeaderTypeEnum.Report}
          />
          <GoalCalculator />
        </>
      }
      rightPanel={rightPanel}
      rightOpen={!!rightPanelContent}
    />
  );
};

const GoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Goal Calculation')}`}</title>
      </Head>
      {accountListId ? (
        <ReportPageWrapper>
          <GoalCalculatorProvider>
            <GoalCalculatorContent
              isNavListOpen={isNavListOpen}
              onNavListToggle={handleNavListToggle}
              designationAccounts={designationAccounts}
              setDesignationAccounts={setDesignationAccounts}
            />
          </GoalCalculatorProvider>
        </ReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default GoalCalculatorPage;
