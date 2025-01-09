import React from 'react';
import { Box } from '@mui/material';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';

interface HealthIndicatorReportProps {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const HealthIndicatorReport: React.FC<HealthIndicatorReportProps> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
    </Box>
  );
};
