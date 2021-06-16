import React from 'react';
import type { FC, ReactNode } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NavReportsList } from './NavReportsList/NavReportsList';

interface ReportLayoutProps {
  id: string;
  title: string;
  children: ReactNode;
}

export const ReportLayout: FC<ReportLayoutProps> = ({
  id,
  title,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box height="100vh" display="flex" overflow-y="scroll">
        <NavReportsList selected={id} />
        <Box flex={1}>
          <Box my={2}>
            <Typography variant="h5">{t(title)}</Typography>
          </Box>
          {children}
        </Box>
      </Box>
    </>
  );
};
