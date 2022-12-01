import {
  PartnerGivingAnalysisReportContact,
  SortDirection,
} from '../../../../graphql/types.generated';
import React, { useState } from 'react';
import { Box, CircularProgress, TablePagination } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
import type { Order } from '../Reports.type';
import { useGetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import { PartnerGivingAnalysisReportActions as Actions } from './Actions/Actions';
// import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { ContactFilterSetInput } from 'pages/api/graphql-rest.page.generated';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  contactFilters?: ContactFilterSetInput;
}

export type Contact = PartnerGivingAnalysisReportContact;

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
  contactFilters: filters,
}) => {
  const { t } = useTranslation();
  const [selectedContacts, setSelectedContacts] = useState<Array<string>>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Contact>('name');
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [search] = useDebounce(query, 500);

  const contactFilters: ContactFilterSetInput = {
    ...filters,
    ...(search.length > 0
      ? {
          nameLike: `%${search}%`,
        }
      : {}),
  };

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

  const handleModalOpen = () => {
    return;
  };

  const handleQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.persist();
    setQuery(event.target.value);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property as keyof Contact);
  };

  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSelectedContacts(
      event.target.checked ? contacts.map((contact) => contact.id) : [],
    );
  };

  const handleSelectOne = (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ): void => {
    if (!selectedContacts.includes(contactId)) {
      setSelectedContacts((prevSelected) => [...prevSelected, contactId]);
    } else {
      setSelectedContacts((prevSelected) =>
        prevSelected.filter((id) => id !== contactId),
      );
    }
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
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
      />
      <Actions
        query={query}
        onQueryChange={handleQueryChange}
        onModalOpen={handleModalOpen}
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
            onRequestSort={handleRequestSort}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            order={order}
            orderBy={orderBy}
            contacts={contacts}
            selectedContacts={selectedContacts}
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
