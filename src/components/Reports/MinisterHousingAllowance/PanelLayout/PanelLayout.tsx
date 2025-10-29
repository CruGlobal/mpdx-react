import NextLink from 'next/link';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Divider, IconButton, Link, Stack } from '@mui/material';
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
import { PanelTypeEnum } from '../Shared/sharedTypes';

interface PanelLayoutProps {
  panelType: PanelTypeEnum;
  percentComplete?: number;
  sidebarContent?: React.ReactNode;
  backHref?: string;
  sidebarTitle?: string;
  sidebarAriaLabel?: string;
  mainContent?: React.ReactNode;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  panelType,
  percentComplete,
  sidebarContent,
  backHref,
  sidebarTitle,
  sidebarAriaLabel,
  mainContent,
}) => {
  const { t } = useTranslation();

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
            <StyledBox>
              <CircularProgressWithLabel
                progress={percentComplete ? percentComplete : 0}
              />
            </StyledBox>
            <Link
              component={NextLink}
              href={backHref ? backHref : ''}
              sx={{ textDecoration: 'none' }}
              aria-label={t('Go back')}
            >
              <IconButton
                sx={(theme) => ({
                  color: theme.palette.cruGrayDark.main,
                })}
              >
                <ArrowBackIcon />
              </IconButton>
            </Link>
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
