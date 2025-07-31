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
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const GoalCalculatorPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const GoalCalculatorContent: React.FC<{
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  designationAccounts: string[];
  setDesignationAccounts: (accounts: string[]) => void;
}> = ({
  isNavListOpen,
  onNavListToggle,
  designationAccounts,
  setDesignationAccounts,
}) => {
  const { currentStep, isRightOpen, toggleRightPanel } = useGoalCalculator();
  const { rightPanelComponent: rightPanelStepComponent } = currentStep || {};
  const { t } = useTranslation();

  const rightPanel = (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding={1}
        borderBottom="1px solid"
        borderColor="cruGrayLight.main"
      >
        <Typography variant="h6" fontSize="0.875rem">
          {t('Details')}
        </Typography>
        <IconButton
          size="small"
          onClick={() => toggleRightPanel()}
          aria-label={t('Close Panel')}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box>{rightPanelStepComponent}</Box>
    </Box>
  );

  const leftPanel = (
    <Box>
      <MultiPageMenu
        isOpen={isNavListOpen}
        selectedId="goalCalculation"
        onClose={onNavListToggle}
        designationAccounts={designationAccounts}
        setDesignationAccounts={setDesignationAccounts}
        navType={NavTypeEnum.Reports}
      />
    </Box>
  );

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={leftPanel}
      leftOpen={isNavListOpen}
      leftWidth="290px"
      rightWidth="290px"
      mainContent={
        <GoalCalculator
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
        />
      }
      rightPanel={rightPanel}
      rightOpen={isRightOpen && !!rightPanelStepComponent}
    />
  );
};

const PageContent: React.FC = () => {
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return accountListId ? (
    <GoalCalculatorPageWrapper>
      <GoalCalculatorProvider>
        <GoalCalculatorContent
          isNavListOpen={isNavListOpen}
          onNavListToggle={handleNavListToggle}
          designationAccounts={designationAccounts}
          setDesignationAccounts={setDesignationAccounts}
        />
      </GoalCalculatorProvider>
    </GoalCalculatorPageWrapper>
  ) : (
    <Loading loading />
  );
};

const GoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Goal Calculation')}`}</title>
      </Head>
      <ContactPanelProvider>
        <PageContent />
      </ContactPanelProvider>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default GoalCalculatorPage;
