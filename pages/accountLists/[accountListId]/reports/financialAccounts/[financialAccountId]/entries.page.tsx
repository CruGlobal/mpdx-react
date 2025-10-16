import Head from 'next/head';
import React, { ReactElement, useContext, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { AccountTransactions } from 'src/components/Reports/FinancialAccountsReport/AccountTransactions/AccountTransactions';
import {
  defaultEndDate,
  defaultStartDate,
} from 'src/components/Reports/FinancialAccountsReport/AccountTransactions/AccountTransactionsHelper';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from 'src/components/Reports/FinancialAccountsReport/Context/FinancialAccountsContext';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { Panel } from '../../helpers';
import { FinancialAccountsWrapper } from './Wrapper';

const FinancialAccountEntries = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  const {
    isNavListOpen,
    designationAccounts,
    setDesignationAccounts,
    handleNavListToggle,
    financialAccountQuery,
    panelOpen,
    setPanelOpen,
  } = useContext(FinancialAccountContext) as FinancialAccountType;

  const { data } = financialAccountQuery;

  const filterGroups = useMemo(() => {
    const categoryOptions =
      data?.financialAccount.categories.nodes
        .map((category) => {
          const name = category?.name ?? category?.code ?? '';
          return {
            __typename: 'FilterOption' as const,
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
            __typename: 'DaterangeFilter' as const,
            title: 'Transaction Date',
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
            __typename: 'RadioFilter' as const,
            title: 'Category',
            filterKey: 'categoryId',
            defaultSelection: '',
            options: [
              {
                __typename: 'FilterOption' as const,
                value: 'all-categories',
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

  return (
    <>
      <Head>
        <title>
          {`${appName} | ${t('Transactions Report - Responsibility Centers')}`}
        </title>
      </Head>

      {accountListId ? (
        <Box sx={{ background: 'common.white' }}>
          <SidePanelsLayout
            headerHeight={headerHeight}
            isScrollBox={false}
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={<AccountTransactions />}
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
                  filters={filterGroups}
                  defaultExpandedFilterGroups={
                    new Set(['Transaction Date', 'Category'])
                  }
                  savedFilters={[]}
                  onClose={() => setPanelOpen(null)}
                  showSaveButton={false}
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

const FinancialAccountsPage: React.FC = () => {
  const defaultDateRange = useMemo(
    () => ({
      min: defaultStartDate(),
      max: defaultEndDate(),
    }),
    [],
  );

  return (
    <UrlFiltersProvider defaultFilters={{ dateRange: defaultDateRange }}>
      <FinancialAccountsWrapper>
        <FinancialAccountEntries />
      </FinancialAccountsWrapper>
    </UrlFiltersProvider>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default FinancialAccountsPage;
