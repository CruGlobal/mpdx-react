import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { sortBy } from 'lodash';
import { PartnerGivingAnalysisReport } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';

import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';

import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import { ReportContactFilterSetInput } from 'pages/api/graphql-rest.page.generated';
import { useContactFiltersQuery } from '../../contacts/Contacts.generated';
import { useDebounce } from 'use-debounce';
import { ContactsPageProvider } from '../../contacts/ContactsPageContext';
import { ContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/ContactsRightPanel';
import { useRouter } from 'next/router';

const PartnerGivingAnalysisReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

// The order here is also the sort order and the display order
const reportFilters = [
  'designation_account_id',
  'donation_date',
  'donation_period_sum',
  'donation_period_count',
  'donation_period_average',
  'donation_period_percent_rank',
];

const PartnerGivingAnalysisReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const router = useRouter();
  const { contactId } = router.query;
  if (typeof contactId === 'string') {
    throw new Error('contactId must not be a string');
  }
  const selectedContactId =
    typeof contactId === 'undefined' ? null : contactId[0];

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const [activeFilters, setActiveFilters] =
    useState<ReportContactFilterSetInput>({});
  const [debouncedFilters] = useDebounce(activeFilters, 500);
  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const filterGroups = useMemo(() => {
    // Move the donation sliders into their own group
    const groups =
      filterData?.accountList.partnerGivingAnalysisFilterGroups ?? [];
    const reportFilterGroup = {
      __typename: 'FilterGroup' as const,
      name: 'Report Filters',
      featured: true,
      filters: sortBy(
        groups
          .flatMap((group) => group.filters)
          .filter((filter) => reportFilters.includes(filter.filterKey)),
        (filter) =>
          reportFilters.findIndex(
            (reportFilter) => reportFilter === filter.filterKey,
          ),
      ),
    };
    return [reportFilterGroup, ...groups];
  }, [filterData]);

  const handleSelectContact = (contactId: string) => {
    router.push(
      `/accountLists/${accountListId}/reports/partnerGivingAnalysis/${contactId}`,
    );
  };

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {selectedContactId}
      {accountListId ? (
        <PartnerGivingAnalysisReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={true}
            leftPanel={
              isNavListOpen && filtersLoading ? (
                <Loading loading />
              ) : (
                <FilterPanel
                  filters={filterGroups}
                  defaultExpandedFilterGroups={new Set(['Report Filters'])}
                  savedFilters={[]}
                  selectedFilters={activeFilters}
                  onClose={() => setNavListOpen(false)}
                  onSelectedFiltersChanged={setActiveFilters}
                />
              )
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <PartnerGivingAnalysisReport
                accountListId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                onSelectContact={handleSelectContact}
                title={t('Partner Giving Analysis Report')}
                contactFilters={debouncedFilters}
              />
            }
            rightPanel={
              selectedContactId ? (
                <ContactsPageProvider>
                  <ContactsRightPanel onClose={() => handleSelectContact('')} />
                </ContactsPageProvider>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
          />
        </PartnerGivingAnalysisReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerGivingAnalysisReportPage;
