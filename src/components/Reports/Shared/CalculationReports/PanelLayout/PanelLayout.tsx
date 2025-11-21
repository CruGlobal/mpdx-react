import NextLink from 'next/link';
import React from 'react';
import { CheckCircleOutline } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Divider, IconButton, Link, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CircularProgressWithLabel } from 'src/components/Reports/GoalCalculator/SharedComponents/CircularProgressWithLabel/CircularProgressWithLabel';
import {
  MainContent,
  PrintableStack,
  SidebarTitle,
  StyledBox,
  StyledSidebar,
  iconPanelWidth,
} from 'src/components/Reports/Shared/CalculationReports/Shared/styledComponents/PanelLayoutStyles';
import { Steps } from 'src/components/Reports/Shared/CalculationReports/StepsList/StepsList';
import theme from 'src/theme';
import { PanelTypeEnum } from '../Shared/sharedTypes';

export interface IconPanelItem {
  key?: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export interface PanelLayoutProps {
  panelType: PanelTypeEnum;
  percentComplete: number;
  icons?: IconPanelItem[];
  sidebarContent?: React.ReactNode;
  backHref: string;
  backTitle?: string;
  sidebarTitle?: string;
  isSidebarOpen?: boolean;
  sidebarAriaLabel?: string;
  mainContent?: React.ReactNode;
  currentIndex?: number;
  steps?: Steps[];
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  panelType,
  percentComplete,
  icons,
  sidebarContent,
  backHref,
  backTitle,
  sidebarTitle,
  isSidebarOpen = false,
  sidebarAriaLabel,
  mainContent,
  currentIndex,
  steps,
}) => {
  const { t } = useTranslation();

  const isLastStep = steps ? currentIndex === steps.length - 1 : false;

  return (
    <PrintableStack direction="row">
      {panelType === PanelTypeEnum.Empty ? (
        <>
          <Stack direction="column" width={iconPanelWidth}></Stack>
          <Divider orientation="vertical" flexItem />
          <StyledSidebar open={true} aria-label={sidebarAriaLabel}>
            {sidebarTitle && (
              <SidebarTitle variant="h6">{sidebarTitle}</SidebarTitle>
            )}
          </StyledSidebar>
          <Divider orientation="vertical" flexItem />
          <MainContent>{mainContent}</MainContent>
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
                {icons?.map((item) => (
                  <IconButton
                    key={item.key}
                    aria-label={item.label}
                    sx={{
                      color: item.isActive
                        ? theme.palette.mpdxBlue.main
                        : theme.palette.cruGrayDark.main,
                    }}
                    onClick={item.onClick}
                  >
                    {item.icon}
                  </IconButton>
                ))}
                <Link
                  component={NextLink}
                  href={backHref}
                  sx={{ textDecoration: 'none' }}
                  aria-label={backTitle ?? t('Back to dashboard')}
                >
                  <IconButton
                    title={backTitle ?? t('Back to dashboard')}
                    sx={(theme) => ({
                      color: theme.palette.cruGrayDark.main,
                    })}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Link>
              </>
            )}
          </Stack>
          <Divider orientation="vertical" flexItem />
          <StyledSidebar
            open={isSidebarOpen}
            aria-label={sidebarAriaLabel}
            aria-expanded={isSidebarOpen}
          >
            {sidebarTitle && (
              <SidebarTitle variant="h6">{sidebarTitle}</SidebarTitle>
            )}
            {sidebarContent}
          </StyledSidebar>
          <Divider orientation="vertical" flexItem />
          <MainContent className="main-content">{mainContent}</MainContent>
        </>
      )}
    </PrintableStack>
  );
};
