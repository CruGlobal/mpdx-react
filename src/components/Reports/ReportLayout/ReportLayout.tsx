import React from 'react';
import type { FC, ReactNode } from 'react';
import { Box } from '@material-ui/core';
import { NavReportsList } from './NavReportsList/NavReportsList';

interface ReportLayoutProps {
  selectedId: string;
  children: ReactNode;
}

export const ReportLayout: FC<ReportLayoutProps> = ({
  selectedId,
  children,
}) => {
  return (
    <>
      <Box height="100vh" display="flex" overflow-y="scroll" mx={2}>
        <NavReportsList selected={selectedId} />
        <Box flex={1}>{children}</Box>
      </Box>
    </>
  );
};
