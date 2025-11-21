import { useRouter } from 'next/router';
import React from 'react';
import { CheckCircleOutline } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Divider, IconButton, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CircularProgressWithLabel } from 'src/components/Reports/GoalCalculator/SharedComponents/CircularProgressWithLabel/CircularProgressWithLabel';
import {
  MainContent,
  PrintableStack,
  SidebarTitle,
  StyledBox,
  StyledSidebar,
  iconPanelWidth,
} from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum, PanelTypeEnum } from '../Shared/sharedTypes';

interface PanelLayoutProps {
  panelType: PanelTypeEnum;
  sidebarContent?: React.ReactNode;
  sidebarTitle?: string;
  sidebarAriaLabel?: string;
  mainContent?: React.ReactNode;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  panelType,
  sidebarContent,
  sidebarTitle,
  sidebarAriaLabel,
  mainContent,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { handlePreviousStep, percentComplete, currentIndex, steps, pageType } =
    useMinisterHousingAllowance();

  const handleGoBack = () => {
    router.back();
  };

  const isLastStep = steps ? currentIndex === steps.length - 1 : false;
  const isNotFirstStep = currentIndex !== 0;

  return (
    <PrintableStack direction="row">
      {panelType === PanelTypeEnum.Empty ? (
        <>
          <Stack direction="column" width={iconPanelWidth}>
            {pageType === PageEnum.View && (
              <IconButton
                aria-label={t('Go back')}
                onClick={handleGoBack}
                sx={(theme) => ({
                  color: theme.palette.cruGrayDark.main,
                })}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
          </Stack>
          <Divider orientation="vertical" flexItem />
          <StyledSidebar open={true} aria-label={sidebarAriaLabel}>
            {sidebarTitle && (
              <SidebarTitle variant="h6">{sidebarTitle}</SidebarTitle>
            )}
          </StyledSidebar>
          <Divider orientation="vertical" flexItem />
          <MainContent className="main-content">{mainContent}</MainContent>
        </>
      ) : (
        <>
          <Stack direction="column" width={iconPanelWidth}>
            {isLastStep ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <CheckCircleOutline
                  sx={{ color: 'success.main', fontSize: 30 }}
                />
              </Box>
            ) : (
              <>
                <StyledBox>
                  <CircularProgressWithLabel progress={percentComplete} />
                </StyledBox>
                {isNotFirstStep && (
                  <IconButton
                    aria-label={t('Go back')}
                    onClick={handlePreviousStep}
                    sx={(theme) => ({
                      color: theme.palette.cruGrayDark.main,
                    })}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
          <Divider orientation="vertical" flexItem />
          <StyledSidebar
            open={true}
            aria-label={sidebarAriaLabel}
            aria-expanded={true}
          >
            {sidebarTitle && (
              <SidebarTitle variant="h6">{sidebarTitle}</SidebarTitle>
            )}
            {sidebarContent}
          </StyledSidebar>
          <Divider orientation="vertical" flexItem />
          <MainContent className="main-content">{mainContent}</MainContent>
          <Divider orientation="vertical" flexItem />
        </>
      )}
    </PrintableStack>
  );
};
