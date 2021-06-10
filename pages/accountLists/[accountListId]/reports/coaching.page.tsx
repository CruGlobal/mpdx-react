import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { ControlsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportSidePanel/ControlsSection';
import { MpdInfoSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportSidePanel/MpdInfoSection';
import { UsersSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportSidePanel/UsersSection';
import { CoachesSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportSidePanel/CoachesSection';
import { CoachingReportHeader } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/CoachingReportHeader';
import { MonthlyActivitySection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/MonthlyActivitySection';
import { CommitmentsReceivedSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/CommitmentsRecievedSection';
import { AppointmentsAndResultsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/AppointmentsAndResultsSection';
import { ActivitySummarySection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/ActivitySummarySection';
import { ActivityBreakdownSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/ActivityBreakdownSection';
import { OutstandingRecurringCommitmentsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/OutstandingRecurringCommitmentsSection';
import { OutstandingSpecialNeedsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/OutstandingSpecialNeedsSection';
import { ContactTagsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/ContactTagsSection';
import { TaskTagsSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/TaskTagsSection';
import { WeeklyReportSection } from '../../../../src/components/Reports/CoachingReport/CoachingReportMainSection/WeeklyReportSection';
import Loading from '../../../../src/components/Loading';

const CoachingReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const { query, isReady } = useRouter();

  const { accountListId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Coaching')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box height="100vh" display="flex" overflow-y="scroll">
          <Box width="290px">
            <ControlsSection accountListId={accountListId} />
            <MpdInfoSection accountListId={accountListId} />
            <UsersSection accountListId={accountListId} />
            <CoachesSection accountListId={accountListId} />
          </Box>
          <Box flex={1}>
            <CoachingReportHeader accountListId={accountListId} />
            <MonthlyActivitySection accountListId={accountListId} />
            <CommitmentsReceivedSection accountListId={accountListId} />
            <CoachingReportHeader accountListId={accountListId} />
            <AppointmentsAndResultsSection accountListId={accountListId} />
            <ActivitySummarySection accountListId={accountListId} />
            <ActivityBreakdownSection accountListId={accountListId} />
            <OutstandingRecurringCommitmentsSection
              accountListId={accountListId}
            />
            <OutstandingSpecialNeedsSection accountListId={accountListId} />
            <ContactTagsSection accountListId={accountListId} />
            <TaskTagsSection accountListId={accountListId} />
            <WeeklyReportSection accountListId={accountListId} />
          </Box>
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default CoachingReportPage;
