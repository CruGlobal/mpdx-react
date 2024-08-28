import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Box, CircularProgress, TablePagination } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { ListHeader, PageEnum } from 'src/components/Shared/Header/ListHeader';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  PartnerGivingAnalysisReportContact,
  ReportContactFilterSetInput,
  SortDirection,
} from 'src/graphql/types.generated';
import { useGetPartnerGivingAnalysisIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { useGetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import type { Order } from '../Reports.type';

export enum Panel {
  Navigation = 'Navigation',
  Filters = 'Filters',
}

interface Props {
  accountListId: string;
  panelOpen: Panel | null;
  onNavListToggle: () => void;
  onFilterListToggle: () => void;
  activeFilters?: ReportContactFilterSetInput;
  contactDetailsOpen: boolean;
  onSelectContact: (contactId: string) => void;
  title: string;
  contactFilters?: ReportContactFilterSetInput;
}
export type PartnerGivingAnalysisReportRef = {
  clearSearchInput: () => void;
};

export type Contact = PartnerGivingAnalysisReportContact;

export const PartnerGivingAnalysisReport = forwardRef<
  PartnerGivingAnalysisReportRef,
  Props
>(
  (
    {
      accountListId,
      panelOpen,
      onNavListToggle,
      onFilterListToggle,
      activeFilters,
      contactDetailsOpen,
      onSelectContact,
      title,
      contactFilters: filters,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Contact>('name');
    const [limit, setLimit] = useState<number>(10);
    const [page, setPage] = useState<number>(0);
    const [query, setQuery] = useState<string>('');
    const search = useDebouncedValue(query, 500);

    useImperativeHandle(
      ref,
      () => ({
        clearSearchInput() {
          setQuery('');
        },
      }),
      [],
    );

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
            order === 'asc'
              ? SortDirection.Ascending
              : SortDirection.Descending,
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
          isNavListOpen={panelOpen === Panel.Navigation}
          onNavListToggle={onNavListToggle}
          title={title}
          headerType={HeaderTypeEnum.Report}
        />
        <ListHeader
          page={PageEnum.Report}
          activeFilters={isActiveFilters}
          filterPanelOpen={panelOpen === Panel.Filters}
          toggleFilterPanel={onFilterListToggle}
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
              count={
                data?.partnerGivingAnalysisReport.pagination.totalItems ?? 0
              }
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
  },
);

PartnerGivingAnalysisReport.displayName = 'PartnerGivingAnalysisReport';
