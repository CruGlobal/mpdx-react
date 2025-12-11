import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useGridApiRef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { ListHeader, PageEnum } from 'src/components/Shared/Header/ListHeader';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { PartnerGivingAnalysisFilterSetInput } from 'src/graphql/types.generated';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { HeaderActions } from './Actions/HeaderActions';
import { BalanceCard } from './BalanceCard/BalanceCard';
import { AscendingSortEnums, DescendingSortEnums } from './Helper/sortRecords';
import { usePartnerGivingAnalysisQuery } from './PartnerGivingAnalysis.generated';
import { PartnerGivingAnalysisTable as Table } from './Table/Table';

interface Props {
  accountListId: string;
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  title: string;
}

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  panelOpen,
  onNavListToggle,
  onFilterListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const { activeFilters, searchTerm } = useUrlFilters();
  const apiRef = useGridApiRef();

  const contactFilters: PartnerGivingAnalysisFilterSetInput = useMemo(
    () => ({
      ...activeFilters,
      ...(searchTerm && {
        nameLike: `%${searchTerm}%`,
      }),
    }),
    [activeFilters, searchTerm],
  );

  const pageSize = apiRef.current?.state.pagination.paginationModel.pageSize;
  const sortModel = apiRef.current?.state.sorting.sortModel;

  const variables = useMemo(
    () => ({
      input: {
        accountListId,
        filters: contactFilters,
        sortBy:
          sortModel && sortModel.length > 0 && sortModel[0]
            ? sortModel[0].sort === 'asc'
              ? AscendingSortEnums[sortModel[0].field]
              : DescendingSortEnums[sortModel[0].field]
            : null,
      },
      first: pageSize,
    }),
    // pageSize and sortModel are intentionally omitted from the dependencies array so that the query isn't reloaded when the page size or sort order changes
    // If all the pages have loaded and the user changes the page size or sort order, there's no reason to reload all the pages
    [accountListId, contactFilters],
  );

  const { data, previousData, fetchMore, error, loading } =
    usePartnerGivingAnalysisQuery({
      variables,
    });

  // Load remaining pages in background for printing
  const { loading: loadingAllPages } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.partnerGivingAnalysis.pageInfo,
  });

  const { data: staffAccountData, loading: staffAccountLoading } =
    useStaffAccountQuery();

  const contacts = data?.partnerGivingAnalysis.nodes ?? [];

  const contactCount =
    (data ?? previousData)?.partnerGivingAnalysis?.totalCount ?? 0;
  const { data: allContacts, previousData: allContactsPrevious } =
    useGetPartnerGivingAnalysisIdsForMassSelectionQuery({
      variables: {
        input: {
          accountListId,
          filters: contactFilters,
        },
      },
      skip: contactCount === 0,
    });

  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(
    () =>
      (allContacts ?? allContactsPrevious)?.partnerGivingAnalysis?.nodes.map(
        (contact) => contact.id,
      ) ?? [],
    [allContacts, allContactsPrevious],
  );

  const {
    ids,
    selectionType,
    toggleSelectAll,
    toggleSelectionById,
    isRowChecked,
  } = useMassSelection(allContactIds);

  const handlePrint = () => {
    if (apiRef.current?.exportDataAsPrint) {
      apiRef.current.exportDataAsPrint({ hideFooter: true });
    }
  };

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={panelOpen === Panel.Navigation}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
        rightExtra={
          <HeaderActions onPrint={handlePrint} loading={loadingAllPages} />
        }
      />
      <ListHeader
        page={PageEnum.Report}
        filterPanelOpen={panelOpen === Panel.Filters}
        toggleFilterPanel={onFilterListToggle}
        onCheckAllItems={toggleSelectAll}
        showShowingCount={false}
        totalItems={contactCount}
        headerCheckboxState={selectionType}
        selectedIds={ids}
      />

      {!staffAccountLoading && staffAccountData?.staffAccount?.id ? (
        <BalanceCard
          donationPeriodTotalSum={
            data?.partnerGivingAnalysis?.donationPeriodTotalSum
          }
        />
      ) : null}
      {contacts.length > 0 && (
        <Table
          data={contacts}
          onSelectOne={toggleSelectionById}
          isRowChecked={isRowChecked}
          apiRef={apiRef}
        />
      )}
      {contacts.length === 0 && !loading && (
        <EmptyReport
          title={t('You have {{contacts}} total contacts', {
            contacts: data?.partnerGivingAnalysis.totalCount ?? '?',
          })}
          subTitle={t(
            'Unfortunately none of them match your current search or filters.',
          )}
        />
      )}
    </Box>
  );
};

PartnerGivingAnalysisReport.displayName = 'PartnerGivingAnalysisReport';
