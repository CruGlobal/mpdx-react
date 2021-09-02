import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
// import { usePartnerGivingAnalysisReportQuery } from './GetPartnerGivingAnalysisReport.generated';
import type { Order } from '../Reports.type';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const applyFilters = (
  contacts: Contact[],
  query: string,
  filters: Record<string, unknown>,
): Contact[] => {
  return contacts.filter((contact) => {
    let matches = true;

    if (query) {
      const properties = ['email', 'name'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (contact[property].toLowerCase().includes(query.toLowerCase())) {
          containsQuery = true;
        }
      });

      if (!containsQuery) {
        matches = false;
      }
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value && contact[key] !== value) {
        matches = false;
      }
    });

    return matches;
  });
};

const applyPagination = (
  contacts: Contact[],
  page: number,
  limit: number,
): Contact[] => {
  return contacts.slice(page * limit, page * limit + limit);
};

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [selectedContacts, setSelectedContacts] = useState(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>(5);

  const error: Array<string> | null = null;
  const loading = false;

  const data = {
    partnerGivingAnalysisReport: [
      {
        giftAverage: 88.468,
        giftCount: 176,
        giftTotal: 15218.42,
        currency: 'CAD',
        lastGiftAmount: 150.92,
        lastGiftDate: '2021-07-07',
        id: '01',
        name: 'Ababa, Aladdin und Jasmine (Princess)',
        lifeTimeTotal: 15218.42,
      },
      {
        giftAverage: 71.4,
        giftCount: 127,
        giftTotal: 13118.42,
        currency: 'CAD',
        lastGiftAmount: 170.92,
        lastGiftDate: '2021-03-07',
        id: '02',
        name: 'Princess',
        lifeTimeTotal: 13118.42,
      },
      {
        giftAverage: 86.4682954545454545,
        giftCount: 221,
        giftTotal: 25218.42,
        currency: 'CAD',
        lastGiftAmount: 150.92,
        lastGiftDate: '2021-08-07',
        id: '03',
        name: 'Jasmine (Princess)',
        lifeTimeTotal: 25218.42,
      },
    ],
  };

  // Need to get the real data

  // const { data, loading, error } = usePartnerGivingAnalysisReportQuery({
  //   variables: {
  //     accountListId,
  //   },
  // });

  const orderedContacts = useMemo(() => {
    if (data.partnerGivingAnalysisReport && orderBy !== null) {
      return data.partnerGivingAnalysisReport.sort((a, b) => {
        const compare = a[orderBy]
          .toString()
          .localeCompare(b[orderBy].toString(), undefined, {
            numeric: true,
          });

        return order === 'asc' ? compare : -compare;
      });
    } else {
      return data.partnerGivingAnalysisReport;
    }
  }, [data.partnerGivingAnalysisReport, order, orderBy]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
    event: React.MouseEvent<unknown>,
    newPage: number,
  ): void => {
    setPage(newPage);
  };

  const handleLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setLimit(parseInt(event.target.value));
  };

  const filteredContacts = applyFilters(contacts, query, filters);
  const sortedContacts = applySort(filteredContacts, sort);
  const paginatedContacts = applyPagination(sortedContacts, page, limit);
  const enableBulkOperations = selectedContacts.length > 0;
  const selectedSomeContacts =
    selectedContacts.length > 0 && selectedContacts.length < contacts.length;
  const selectedAllContacts = selectedContacts.length === contacts.length;

  return (
    <Box>
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
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
      ) : error ? (
        <Notification type="error" message={error?.toString()} />
      ) : data?.partnerGivingAnalysisReport.length > 0 ? (
        <Table
          onRequestSort={handleRequestSort}
          onSelectAll={handleSelectAll}
          order={order}
          orderBy={orderBy}
          orderedContacts={orderedContacts}
        />
      ) : (
        <EmptyReport
          title={t('You have 42 total contacts')}
          subTitle={t(
            'Unfortunately none of them match your current search or filters.',
          )}
        />
      )}
    </Box>
  );
};
