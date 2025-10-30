import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { Box, CircularProgress } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid/models/gridPaginationProps';
import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel';
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

export enum FundTypeEnum {
  Primary = 'Primary',
}

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
  const apolloClient = useApolloClient();
  const cursorsRef = useRef(new Map<number, string | null>([[0, null]]));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'name',
      sort: 'asc',
    },
  ]);
  const [shouldFetchAllPages, setShouldFetchAllPages] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const contactFilters: PartnerGivingAnalysisFilterSetInput = useMemo(
    () => ({
      ...activeFilters,
      ...(searchTerm && {
        nameLike: `%${searchTerm}%`,
      }),
    }),
    [activeFilters, searchTerm],
  );

  const { data, previousData, error, fetchMore, loading } =
    usePartnerGivingAnalysisQuery({
      variables: {
        input: {
          accountListId,
          filters: contactFilters,
          sortBy: sortModel[0].sort
            ? sortModel[0].sort === 'asc'
              ? AscendingSortEnums[sortModel[0].field]
              : DescendingSortEnums[sortModel[0].field]
            : null,
        },
        first: shouldFetchAllPages ? 10000 : paginationModel.pageSize,
        after: shouldFetchAllPages
          ? null
          : (cursorsRef.current.get(paginationModel.page) ?? null),
      },
    });

  const { data: staffAccountData, loading: staffAccountLoading } =
    useStaffAccountQuery();

  const contacts = data?.partnerGivingAnalysis.nodes ?? [];

  const { loading: fetchingAllPages } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: shouldFetchAllPages
      ? (data ?? previousData)?.partnerGivingAnalysis?.pageInfo
      : undefined,
  });

  const contactCount =
    (data ?? previousData)?.partnerGivingAnalysis?.totalCount ?? 0;
  const { data: allContacts, previousData: allContactsPrevious } =
    useGetPartnerGivingAnalysisIdsForMassSelectionQuery({
      variables: {
        input: {
          accountListId,
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

  useEffect(() => {
    const end = data?.partnerGivingAnalysis.pageInfo.endCursor ?? null;
    const hasNextPage =
      data?.partnerGivingAnalysis.pageInfo.hasNextPage ?? false;
    if (end !== null && hasNextPage) {
      cursorsRef.current.set(paginationModel.page + 1, end);
    }
  }, [data, paginationModel.page]);

  const {
    ids,
    selectionType,
    toggleSelectAll,
    toggleSelectionById,
    isRowChecked,
  } = useMassSelection(allContactIds);

  const handlePageChange = (model: GridPaginationModel) => {
    if (model.pageSize !== paginationModel.pageSize) {
      cursorsRef.current = new Map([[0, null]]);
      setPaginationModel({ page: 0, pageSize: model.pageSize });
    } else {
      setPaginationModel(model);
    }
  };

  const handleSortChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  const handlePrint = (event: React.MouseEvent<unknown>) => {
    event.preventDefault();
    if (!isPrinting) {
      setShouldFetchAllPages(true);
      setIsPrinting(true);
    }
  };

  useEffect(() => {
    const hasNextPage =
      (data ?? previousData)?.partnerGivingAnalysis?.pageInfo?.hasNextPage ??
      false;
    if (
      isPrinting &&
      shouldFetchAllPages &&
      !fetchingAllPages &&
      !hasNextPage
    ) {
      // Wait for React to finish rendering all the data before printing
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [isPrinting, shouldFetchAllPages, fetchingAllPages, data, previousData]);

  // Listen for when printing is done to reset the state
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
      setShouldFetchAllPages(false);
      // Evict the partnerGivingAnalysis cache to force a refetch of just the current page
      apolloClient.cache.evict({
        fieldName: 'partnerGivingAnalysis',
      });
      apolloClient.cache.gc();
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [apolloClient]);

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={panelOpen === Panel.Navigation}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
        rightExtra={<HeaderActions onPrint={handlePrint} />}
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
      {loading || (shouldFetchAllPages && fetchingAllPages) ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress
            data-testid="LoadingPartnerGivingAnalysisReport"
            aria-label={
              shouldFetchAllPages && fetchingAllPages
                ? t('Preparing print...')
                : undefined
            }
          />
        </Box>
      ) : contacts.length ? (
        <>
          {!staffAccountLoading && staffAccountData?.staffAccount?.id ? (
            <BalanceCard />
          ) : null}
          <Table
            data={contacts}
            totalCount={data?.partnerGivingAnalysis.totalCount ?? 0}
            onSelectOne={toggleSelectionById}
            isRowChecked={isRowChecked}
            paginationModel={shouldFetchAllPages ? undefined : paginationModel}
            handlePageChange={
              shouldFetchAllPages ? undefined : handlePageChange
            }
            sortModel={sortModel}
            handleSortChange={handleSortChange}
          />
        </>
      ) : (
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
