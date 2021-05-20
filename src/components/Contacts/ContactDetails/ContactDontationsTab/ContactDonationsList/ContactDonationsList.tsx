import { CircularProgress, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
} from 'mui-datatables';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../../lib/intlFormat/intlFormat';
import { useContactDonationsListQuery } from './ContactDonationsList.generated';

interface ContactDonationsListProp {
  accountListId: string;
  contactId: string;
}

export const ContactDonationsList: React.FC<ContactDonationsListProp> = ({
  accountListId,
  contactId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [range, setRange] = useState(10);

  const {
    data,
    loading,
    fetchMore,
    networkStatus,
  } = useContactDonationsListQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
      first: range,
    },
    notifyOnNetworkStatusChange: true,
  });

  const { t } = useTranslation();

  const handleNextPage = (moveNext = true, newPage: number) => {
    if (loading && !data?.contact) {
      return;
    }

    const endCursor = data?.contact.donations.pageInfo.endCursor;
    const startCursor = data?.contact.donations.pageInfo.startCursor;
    console.log(endCursor);
    console.log(startCursor);

    if (moveNext && data?.contact.donations.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: range,
          after: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            contact: {
              donations: fetchMoreResult.contact.donations,
            },
          };
        },
      }).finally(() => {
        setCurrentPage(newPage);
      });
    }
    if (!moveNext && data?.contact.donations.pageInfo.hasPreviousPage) {
      fetchMore({
        variables: {
          last: range,
          before: startCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            contact: {
              donations: fetchMoreResult.contact.donations,
            },
          };
        },
      }).finally(() => {
        setCurrentPage(newPage);
      });
    }
  };

  const columns: MUIDataTableColumn[] = [
    {
      name: 'donationDate',
      label: t('Date'),
      options: {
        filter: false,
        sort: false,
        customBodyRender: (date, { rowIndex }): ReactElement => {
          const donation = data?.contact.donations.nodes[rowIndex];
          if (!loading && donation && networkStatus !== 3) {
            return (
              <Typography variant="subtitle1">
                {DateTime.fromISO(donation.donationDate).toLocaleString()}
              </Typography>
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
    {
      name: 'amount',
      label: t('Amount'),
      options: {
        filter: false,
        sort: false,
        customBodyRender: (amount, { rowIndex }): ReactElement => {
          const donation = data?.contact.donations.nodes[rowIndex];
          if (!loading && donation && networkStatus !== 3) {
            const {
              amount: { amount, currency },
            } = donation;
            return (
              <Typography variant="subtitle1">
                {currencyFormat(amount, currency)}
              </Typography>
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
    {
      name: 'amount.convertedAmount',
      label: t('Converted Amount'),
      options: {
        filter: false,
        sort: false,
        customBodyRender: (amount, { rowIndex }): ReactElement => {
          const donation = data?.contact.donations.nodes[rowIndex];
          if (!loading && donation && networkStatus !== 3) {
            const {
              amount: { convertedAmount, convertedCurrency },
            } = donation;
            return (
              <Typography variant="subtitle1">
                {currencyFormat(convertedAmount, convertedCurrency)}
              </Typography>
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
  ];

  const options: MUIDataTableOptions = {
    serverSide: true,
    onChangePage: (newPage) => {
      currentPage === newPage ?? currentPage > newPage
        ? handleNextPage(false, newPage)
        : handleNextPage(true, newPage);
    },
    page: currentPage,
    count: data?.contact.donations.totalCount || 0,
    rowsPerPage: range,
    rowsPerPageOptions: [10, 25, 50, 100],
    onChangeRowsPerPage: (rowsPerPage) => {
      data?.contact
        ? fetchMore({
            variables: { first: range },
            updateQuery: (pv, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return pv;
              }
              return {
                contact: {
                  donations: fetchMoreResult.contact.donations,
                },
              };
            },
          }).finally(() => {
            setCurrentPage(0);
            setRange(rowsPerPage);
          })
        : null;
    },
    fixedHeader: false,
    fixedSelectColumn: false,
    print: false,
    download: false,
    selectableRows: 'none',
    search: false,
  };
  return (
    <MUIDataTable
      title={loading && <CircularProgress size={24} />}
      data={
        loading || !data || networkStatus === 3
          ? [['', <Skeleton key={1} />]]
          : data?.contact.donations.nodes
      }
      columns={columns}
      options={options}
    />
  );
};
