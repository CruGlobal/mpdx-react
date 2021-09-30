import React, { useState } from 'react';
import { Box, CircularProgress, TablePagination } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
// import { usePartnerGivingAnalysisReportQuery } from './GetPartnerGivingAnalysisReport.generated';
import type { Order } from '../Reports.type';
import { PartnerGivingAnalysisReportTable as Table } from './Table/Table';
import { PartnerGivingAnalysisReportActions as Actions } from './Actions/Actions';
// import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export type Contact = {
  giftAverage: number;
  giftCount: number;
  giftTotal: number;
  currency: string;
  lastGiftAmount: number;
  lastGiftDate: string;
  id: string;
  name: string;
  lifeTimeTotal: number;
};

type OrderBy = keyof Contact | null;

const applyFilters = (contacts: Contact[], query: string): Contact[] => {
  return contacts.filter((contact) => {
    let matches = true;

    if (query) {
      const properties: Array<keyof Contact> = ['name'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (
          String(contact[property]).toLowerCase().includes(query.toLowerCase())
        ) {
          containsQuery = true;
        }
      });

      if (!containsQuery) {
        matches = false;
      }
    }

    return matches;
  });
};

const applySort = (
  contacts: Contact[],
  order: Order,
  orderBy: OrderBy,
): Contact[] => {
  if (orderBy) {
    return contacts.sort((a, b) => {
      const compare = a[orderBy]
        .toString()
        .localeCompare(b[orderBy].toString(), undefined, {
          numeric: true,
        });

      return order === 'asc' ? compare : -compare;
    });
  } else {
    return contacts;
  }
};

const applyPagination = (
  contacts: Contact[],
  page: number,
  limit: number,
): Contact[] => {
  return contacts.slice(page * limit, page * limit + limit);
};

export const PartnerGivingAnalysisReport: React.FC<Props> = ({
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const [selectedContacts, setSelectedContacts] = useState<Array<string>>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');

  // Mock data
  // const error: Array<string> | null = null;
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

  // const orderedContacts = useMemo(() => {
  //   if (data.partnerGivingAnalysisReport && orderBy !== null) {
  //     return data.partnerGivingAnalysisReport.sort((a, b) => {
  //       const compare = a[orderBy]
  //         .toString()
  //         .localeCompare(b[orderBy].toString(), undefined, {
  //           numeric: true,
  //         });

  //       return order === 'asc' ? compare : -compare;
  //     });
  //   } else {
  //     return data.partnerGivingAnalysisReport;
  //   }
  // }, [data.partnerGivingAnalysisReport, order, orderBy]);

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
    property: keyof Contact,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSelectedContacts(
      event.target.checked
        ? data.partnerGivingAnalysisReport.map((contact: Contact) => contact.id)
        : [],
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

  const filteredContacts = applyFilters(
    data.partnerGivingAnalysisReport,
    query,
  );
  const sortedContacts = applySort(filteredContacts, order, orderBy);
  const paginatedContacts = applyPagination(sortedContacts, page, limit);

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
      ) : data?.partnerGivingAnalysisReport.length > 0 ? (
        <>
          <Actions
            query={query}
            onQueryChange={handleQueryChange}
            onModalOpen={handleModalOpen}
          />
          <Table
            onRequestSort={handleRequestSort}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            order={order}
            orderBy={orderBy}
            contacts={paginatedContacts}
            selectedContacts={selectedContacts}
          />
          <TablePagination
            component="div"
            count={filteredContacts.length}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleLimitChange}
            page={page}
            rowsPerPage={limit}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </>
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
