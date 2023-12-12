import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ReportContactFilterSetInput } from 'pages/api/graphql-rest.page.generated';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  Panel,
  PartnerGivingAnalysisReport,
} from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { suggestArticles } from 'src/lib/helpScout';
import { getQueryParam } from 'src/utils/queryParam';
import { useContactFiltersQuery } from '../../contacts/Contacts.generated';
import { ContactsPage } from '../../contacts/ContactsPage';

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

  useEffect(() => {
    suggestArticles('HS_REPORTS_SUGGESTIONS');
  }, []);

  const handleSelectContact = (contactId: string) => {
    router.push(
      `/accountLists/${accountListId}/reports/partnerGivingAnalysis/${contactId}`,
    );
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
                <FilterPanel
                  filters={filterGroups}
                  defaultExpandedFilterGroups={new Set(['Report Filters'])}
                  savedFilters={[]}
                  selectedFilters={activeFilters}
                  onClose={() => setPanelOpen(null)}
                  onSelectedFiltersChanged={setActiveFilters}
                />
              )
            ) : undefined
          }
          leftOpen={panelOpen !== null}
          leftWidth="290px"
          mainContent={
            <PartnerGivingAnalysisReport
              accountListId={accountListId}
              activeFilters={activeFilters}
              panelOpen={panelOpen}
              onFilterListToggle={handleFilterListToggle}
              onNavListToggle={handleNavListToggle}
              onSelectContact={handleSelectContact}
              title={t('Partner Giving Analysis')}
              contactFilters={debouncedFilters}
              contactDetailsOpen={!!selectedContactId}
            />
          }
          rightPanel={
            selectedContactId ? (
              <ContactsPage>
                <DynamicContactsRightPanel
                  onClose={() => handleSelectContact('')}
                />
              </ContactsPage>
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
