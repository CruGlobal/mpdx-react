import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, TablePagination } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { ListHeader, PageEnum } from 'src/components/Shared/Header/ListHeader';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  PartnerGivingAnalysis,
  PartnerGivingAnalysisFilterSetInput,
  PartnerGivingAnalysisSortEnum,
} from 'src/graphql/types.generated';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { useTablePaginationLocaleText } from 'src/hooks/useMuiLocaleText';
import { usePartnerGivingAnalysisQuery } from './PartnerGivingAnalysis.generated';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import type { Order } from '../Reports.type';

interface Props {
  accountListId: string;
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  title: string;
}

export type Contact = PartnerGivingAnalysis;

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  panelOpen,
  onNavListToggle,
  onFilterListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<PartnerGivingAnalysisSortEnum>(
    PartnerGivingAnalysisSortEnum.NameAsc,
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const { activeFilters, searchTerm } = useUrlFilters();
  const cursorsRef = useRef(new Map<number, string | null>([[0, null]]));

  const contactFilters: PartnerGivingAnalysisFilterSetInput = {
    ...activeFilters,
    ...(searchTerm && {
      nameLike: `%${searchTerm}%`,
    }),
  };

  const { data, previousData, loading, refetch } =
    usePartnerGivingAnalysisQuery({
      variables: {
        input: {
          accountListId,
          sortBy: orderBy,
          filters: contactFilters,
        },
        first: limit,
        after: cursorsRef.current.get(page) ?? null,
      },
      notifyOnNetworkStatusChange: true,
    });

  const contacts = data?.partnerGivingAnalysis.nodes ?? [];

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
      notifyOnNetworkStatusChange: true,
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

  const localeText = useTablePaginationLocaleText();

  useEffect(() => {
    const end = data?.partnerGivingAnalysis?.pageInfo?.endCursor ?? null;
    if (end !== null) {
      cursorsRef.current.set(page + 1, end);
    }
  }, [data, page]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(PartnerGivingAnalysisSortEnum[property]);
  };

  const handlePageChange = async (
    _event: React.MouseEvent<unknown> | null,
    newPage: number,
  ) => {
    setPage(newPage);
    await refetch({
      input: { accountListId },
      first: limit,
      after: cursorsRef.current.get(newPage) ?? null,
    });
  };

  const handleLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setLimit(parseInt(event.target.value));
  };

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={panelOpen === Panel.Navigation}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
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
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingPartnerGivingAnalysisReport" />
        </Box>
      ) : contacts.length ? (
        <>
          <Table
            onRequestSort={handleRequestSort}
            onSelectOne={toggleSelectionById}
            order={order}
            orderBy={orderBy}
            contacts={contacts}
            isRowChecked={isRowChecked}
          />
          <TablePagination
            colSpan={3}
            count={contactCount}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[10, 25, 50]}
            SelectProps={{
              inputProps: {
                'aria-label': t('rows per page'),
              },
              native: true,
            }}
            {...localeText}
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
