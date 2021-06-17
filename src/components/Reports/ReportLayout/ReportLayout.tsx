import React from 'react';
import type { FC, ReactNode } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ReportHeader } from './ReportHeader/ReportHeader';
import { NavReportsList } from './NavReportsList/NavReportsList';

interface ReportLayoutProps {
  selectedId: string;
  title: string;
  children: ReactNode;
}

export const ReportLayout: FC<ReportLayoutProps> = ({
  selectedId,
  title,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box height="100vh" display="flex" overflow-y="scroll" mx={2}>
        <NavReportsList selected={selectedId} />
        <Box flex={1}>
          <ReportHeader title={t(title)} />
          {children}
        </Box>
      </Box>
    </>
  );
};
