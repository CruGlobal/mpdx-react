import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { PartnerGivingAnalysisReport } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';

import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';

import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import { ContactFilterSetInput } from 'pages/api/graphql-rest.page.generated';
import { useContactFiltersQuery } from '../contacts/Contacts.generated';

const PartnerGivingAnalysisReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const PartnerGivingAnalysisReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>({});
  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {accountListId ? (
        <PartnerGivingAnalysisReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={true}
            leftPanel={
              isNavListOpen && filtersLoading ? (
                <Loading loading />
              ) : (
                <FilterPanel
                  filters={filterData?.accountList.contactFilterGroups ?? []}
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
                title={t('Partner Giving Analysis Report')}
                contactFilters={activeFilters}
              />
            }
          />
        </PartnerGivingAnalysisReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerGivingAnalysisReportPage;
