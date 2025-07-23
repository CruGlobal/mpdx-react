import Head from 'next/head';
import React, { useMemo, useState } from 'react';
import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { PartnerGivingAnalysisReport } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  ContactPanelProvider,
  useContactPanel,
} from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useContactFiltersQuery } from '../../contacts/Contacts.generated';
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

const PageContent: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isOpen } = useContactPanel();
  const [panelOpen, setPanelOpen] = useState<Panel | null>(Panel.Filters);

  const handleNavListToggle = () => {
    setPanelOpen(panelOpen === Panel.Navigation ? null : Panel.Navigation);
  };

  const handleFilterListToggle = () => {
    setPanelOpen(panelOpen === Panel.Filters ? null : Panel.Filters);
  };

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
      name: t('Report Filters'),
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
  }, [filterData, t]);

  return accountListId ? (
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
            <DynamicFilterPanel
              filters={filterGroups}
              defaultExpandedFilterGroups={new Set(['Report Filters'])}
              savedFilters={[]}
              onClose={() => setPanelOpen(null)}
            />
          )
        ) : undefined
      }
      leftOpen={panelOpen !== null}
      leftWidth="290px"
      mainContent={
        <PartnerGivingAnalysisReport
          accountListId={accountListId}
          panelOpen={panelOpen}
          onFilterListToggle={handleFilterListToggle}
          onNavListToggle={handleNavListToggle}
          title={t('Partner Giving Analysis')}
          contactDetailsOpen={isOpen}
        />
      }
      rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
      rightOpen={isOpen}
      rightWidth="60%"
    />
  ) : (
    <Loading loading />
  );
};

const PartnerGivingAnalysisReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {`${appName} | ${t('Reports')} | ${t('Partner Giving Analysis')}`}
        </title>
      </Head>
      <UrlFiltersProvider>
        <ContactPanelProvider>
          <PageContent />
        </ContactPanelProvider>
      </UrlFiltersProvider>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default PartnerGivingAnalysisReportPage;
