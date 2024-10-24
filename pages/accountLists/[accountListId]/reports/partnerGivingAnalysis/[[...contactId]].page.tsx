import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo, useRef, useState } from 'react';
import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ReportContactFilterSetInput } from 'pages/api/graphql-rest.page.generated';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  PartnerGivingAnalysisReport,
  PartnerGivingAnalysisReportRef,
} from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactLinks } from 'src/hooks/useContactLinks';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { getQueryParam } from 'src/utils/queryParam';
import { useContactFiltersQuery } from '../../contacts/Contacts.generated';
import { ContactsWrapper } from '../../contacts/ContactsWrapper';
import { Panel } from '../helpers';

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
  const { appName } = useGetAppSettings();
  const [panelOpen, setPanelOpen] = useState<Panel | null>(null);
  const reportRef = useRef<PartnerGivingAnalysisReportRef>(null);

  const router = useRouter();
  const selectedContactId = getQueryParam(router.query, 'contactId');

  const handleNavListToggle = () => {
    setPanelOpen(panelOpen === Panel.Navigation ? null : Panel.Navigation);
  };

  const handleFilterListToggle = () => {
    setPanelOpen(panelOpen === Panel.Filters ? null : Panel.Filters);
  };

  const [activeFilters, setActiveFilters] =
    useState<ReportContactFilterSetInput>({});
  const { handleCloseContact } = useContactLinks({
    url: `/accountLists/${accountListId}/reports/partnerGivingAnalysis/`,
  });
  const debouncedFilters = useDebouncedValue(activeFilters, 500);
  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
    context: {
      doNotBatch: true,
    },
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

  const handleClearSearch = () => {
    reportRef.current?.clearSearchInput();
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {accountListId ? (
        <SidePanelsLayout
          isScrollBox={true}
          leftPanel={
            panelOpen === Panel.Navigation ? (
              <MultiPageMenu
                isOpen
                selectedId="donations"
                onClose={() => setPanelOpen(null)}
                navType={NavTypeEnum.Reports}
              />
            ) : panelOpen === Panel.Filters ? (
              filtersLoading ? (
                <Loading loading />
              ) : (
                <ContactsProvider
                  activeFilters={{}}
                  setActiveFilters={() => undefined}
                  starredFilter={{}}
                  setStarredFilter={() => undefined}
                  filterPanelOpen={false}
                  setFilterPanelOpen={() => undefined}
                  contactId={undefined}
                  setContactId={() => undefined}
                  getContactHrefObject={() => ({ pathname: '', query: {} })}
                  searchTerm={''}
                  setSearchTerm={() => {}}
                >
                  <DynamicFilterPanel
                    filters={filterGroups}
                    defaultExpandedFilterGroups={new Set(['Report Filters'])}
                    savedFilters={[]}
                    selectedFilters={activeFilters}
                    onClose={() => setPanelOpen(null)}
                    onSelectedFiltersChanged={setActiveFilters}
                    onHandleClearSearch={handleClearSearch}
                  />
                </ContactsProvider>
              )
            ) : undefined
          }
          leftOpen={panelOpen !== null}
          leftWidth="290px"
          mainContent={
            <PartnerGivingAnalysisReport
              ref={reportRef}
              accountListId={accountListId}
              activeFilters={activeFilters}
              panelOpen={panelOpen}
              onFilterListToggle={handleFilterListToggle}
              onNavListToggle={handleNavListToggle}
              title={t('Partner Giving Analysis')}
              contactFilters={debouncedFilters}
              contactDetailsOpen={!!selectedContactId}
            />
          }
          rightPanel={
            selectedContactId ? (
              <ContactsWrapper>
                <DynamicContactsRightPanel onClose={handleCloseContact} />
              </ContactsWrapper>
            ) : undefined
          }
          rightOpen={typeof selectedContactId !== 'undefined'}
          rightWidth="60%"
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = loadSession;

export default PartnerGivingAnalysisReportPage;
