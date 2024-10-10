import Head from 'next/head';
import React, { ReactElement, useContext, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccountsContext';
import { MainContent } from 'src/components/Reports/FinancialAccountsReport/MainContent/MainContent';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import {
  ContextTypesEnum,
  FilterInput,
} from 'src/components/Shared/Filters/FilterPanel';
import { FilterPanelGroupFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { Panel } from '../helpers';
import {
  FinancialAccountTransactionFilters,
  FinancialAccountsWrapper,
} from './Wrapper';

const FinancialAccounts = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  const {
    isNavListOpen,
    designationAccounts,
    setDesignationAccounts,
    handleNavListToggle,
    financialAccountsQuery,
    activeFilters,
    panelOpen,
    setPanelOpen,
    setActiveFilters,
    setSearchTerm,
  } = useContext(FinancialAccountContext) as FinancialAccountType;

  const { data } = financialAccountsQuery;

  const filterGroups = useMemo(() => {
    const categoryOptions =
      data?.financialAccount.categories.nodes
        .map((category) => {
          const name = category?.name ?? category?.code;
          return {
            __typename: 'FilterOption',
            value: category.id,
            name,
            placeholder: name,
          };
        })
        .sort((a, b) =>
          a.name && b.name ? a.name.localeCompare(b.name) : 0,
        ) ?? [];

    return [
      {
        __typename: 'FilterGroup' as const,
        name: 'Transaction Date',
        featured: true,
        filters: [
          {
            __typename: 'DaterangeFilter',
            filterKey: 'dateRange',
            options: [],
          },
        ],
      },
      {
        __typename: 'FilterGroup' as const,
        name: 'Category',
        featured: true,
        filters: [
          {
            __typename: 'RadioFilter',
            title: 'Category',
            filterKey: 'categoryId',
            defaultSelection: '',
            options: [
              {
                __typename: 'FilterOption',
                value: '',
                name: 'All Categories',
                placeholder: 'All Categories',
              },
              ...categoryOptions,
            ],
          },
        ],
      },
    ];
  }, [data]);

  const handleSelectedFiltersChanged = (selectedFilters: FilterInput) => {
    setActiveFilters(selectedFilters as FinancialAccountTransactionFilters);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports - Responsibility Centers')}
        </title>
      </Head>

      {accountListId ? (
        <Box sx={{ background: 'common.white' }}>
          <SidePanelsLayout
            headerHeight={headerHeight}
            isScrollBox={false}
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={<MainContent />}
            leftPanel={
              panelOpen === Panel.Navigation ? (
                <MultiPageMenu
                  isOpen={isNavListOpen}
                  selectedId="financialAccounts"
                  onClose={handleNavListToggle}
                  designationAccounts={designationAccounts}
                  setDesignationAccounts={setDesignationAccounts}
                  navType={NavTypeEnum.Reports}
                />
              ) : panelOpen === Panel.Filters ? (
                <DynamicFilterPanel
                  filters={filterGroups as FilterPanelGroupFragment[]}
                  defaultExpandedFilterGroups={
                    new Set(['Transaction Date', 'Category'])
                  }
                  savedFilters={[]}
                  selectedFilters={activeFilters as FilterInput}
                  onClose={() => setPanelOpen(null)}
                  onSelectedFiltersChanged={handleSelectedFiltersChanged}
                  onHandleClearSearch={handleClearSearch}
                  contextType={ContextTypesEnum.FinancialAccountReport}
                />
              ) : undefined
            }
          />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

const FinancialAccountsPage: React.FC = () => (
  <FinancialAccountsWrapper>
    <FinancialAccounts />
  </FinancialAccountsWrapper>
);

export const getServerSideProps = loadSession;

export default FinancialAccountsPage;
