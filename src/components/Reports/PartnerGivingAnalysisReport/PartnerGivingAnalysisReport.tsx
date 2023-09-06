import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, TablePagination } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import {
  MultiPageHeader,
  HeaderTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import {
  ReportContactFilterSetInput,
  PartnerGivingAnalysisReportContact,
  SortDirection,
} from '../../../../graphql/types.generated';
import type { Order } from '../Reports.type';
import { useGetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { ListHeader } from 'src/components/Shared/Header/ListHeader';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  activeFilters?: ReportContactFilterSetInput;
  contactDetailsOpen: boolean;
  onNavListToggle: () => void;
  onSelectContact: (contactId: string) => void;
  title: string;
  contactFilters?: ReportContactFilterSetInput;
}

export type Contact = PartnerGivingAnalysisReportContact;

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  activeFilters,
  contactDetailsOpen,
  onNavListToggle,
  onSelectContact,
  title,
  contactFilters: filters,
}) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Contact>('name');
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const search = useDebouncedValue(query, 500);

  const contactFilters: ReportContactFilterSetInput = {
    ...(filters && sanitizeFilters(filters)),
    ...(search.length > 0 && {
      nameLike: `%${search}%`,
    }),
  };

  const isActiveFilters = activeFilters
    ? Object.keys(activeFilters).length > 0
    : false;

  const { data, loading } = useGetPartnerGivingAnalysisReportQuery({
    variables: {
      input: {
        accountListId,
        // Page 1 is the first page for the API
        page: page + 1,
        pageSize: limit,
        sortField: orderBy ?? '',
        sortDirection:
          order === 'asc' ? SortDirection.Ascending : SortDirection.Descending,
        contactFilters,
      },
    },
  });
  const contacts = data?.partnerGivingAnalysisReport.contacts ?? [];

  const contactCount = data?.partnerGivingAnalysisReport?.totalContacts ?? 0;
  const { data: allContacts } =
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
  const allContactIds = useMemo(
    () =>
      allContacts?.partnerGivingAnalysisReport?.contacts.map(
        (contact) => contact.id,
      ) ?? [],
    [allContacts],
  );

  const {
    ids,
    selectionType,
    toggleSelectAll,
    toggleSelectionById,
    isRowChecked,
  } = useMassSelection(contactCount, allContactIds, activeFilters, query);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property as keyof Contact);
  };

  const handlePageChange = (
    event: React.MouseEvent<unknown> | null,
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
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
      <ListHeader
        page="report"
        activeFilters={isActiveFilters}
        filterPanelOpen={isNavListOpen}
        toggleFilterPanel={onNavListToggle}
        contactDetailsOpen={contactDetailsOpen}
        onCheckAllItems={toggleSelectAll}
        showShowingCount={false}
        onSearchTermChanged={(string) => setQuery(string)}
        searchTerm={query}
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
      ) : contacts.length > 0 ? (
        <>
          <Table
            onClick={onSelectContact}
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
                'aria-label': 'rows per page',
              },
              native: true,
            }}
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
