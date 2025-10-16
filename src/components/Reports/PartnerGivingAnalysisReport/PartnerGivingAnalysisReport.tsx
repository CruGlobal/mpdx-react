import React, { useMemo, useState } from 'react';
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
  PartnerGivingAnalysisReportContact,
  ReportContactFilterSetInput,
  SortDirection,
} from 'src/graphql/types.generated';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { useTablePaginationLocaleText } from 'src/hooks/useMuiLocaleText';
import { useGetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import type { Order } from '../Reports.type';

interface Props {
  accountListId: string;
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  title: string;
}

export type Contact = PartnerGivingAnalysisReportContact;

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  panelOpen,
  onNavListToggle,
  onFilterListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Contact>('name');
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const { activeFilters, searchTerm } = useUrlFilters();

  const contactFilters: ReportContactFilterSetInput = {
    ...activeFilters,
    ...(searchTerm && {
      nameLike: `%${searchTerm}%`,
    }),
  };

  const { data, previousData, loading } =
    useGetPartnerGivingAnalysisReportQuery({
      variables: {
        input: {
          accountListId,
          // Page 1 is the first page for the API
          page: page + 1,
          pageSize: limit,
          sortField: orderBy ?? '',
          sortDirection:
            order === 'asc'
              ? SortDirection.Ascending
              : SortDirection.Descending,
          contactFilters,
        },
      },
    });
  const contacts = data?.partnerGivingAnalysisReport.contacts ?? [];

  const contactCount =
    (data ?? previousData)?.partnerGivingAnalysisReport?.totalContacts ?? 0;
  const { data: allContacts, previousData: allContactsPrevious } =
    useGetPartnerGivingAnalysisIdsForMassSelectionQuery({
      variables: {
        input: {
          accountListId,
          page: 1,
          pageSize: contactCount,
          sortField: '',
          sortDirection: SortDirection.Ascending,
          contactFilters,
        },
      },
      skip: contactCount === 0,
    });
  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(
    () =>
      (
        allContacts ?? allContactsPrevious
      )?.partnerGivingAnalysisReport?.contacts.map((contact) => contact.id) ??
      [],
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

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property as keyof Contact);
  };

  const handlePageChange = (
    _event: React.MouseEvent<unknown> | null,
    newPage: number,
  ): void => {
    setPage(newPage);
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
            count={data?.partnerGivingAnalysisReport.pagination.totalItems ?? 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
            // Page 0 is the first page for the component
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
            contacts: data?.partnerGivingAnalysisReport.totalContacts ?? '?',
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
