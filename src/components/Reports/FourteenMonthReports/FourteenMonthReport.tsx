import React, { useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Theme, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { FourteenMonthReportCurrencyType } from '../../../../graphql/types.generated';
import type { Order } from '../Reports.type';
import { FourteenMonthReportHeader as Header } from './Layout/Header/Header';
import { useFourteenMonthReportQuery } from './GetFourteenMonthReport.generated';
import type { Contact, OrderBy } from './Layout/Table/TableHead/TableHead';
import { FourteenMonthReportTable as Table } from './Layout/Table/Table';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  currencyType: FourteenMonthReportCurrencyType;
}

export const FourteenMonthReport: React.FC<Props> = ({
  accountListId,
  currencyType,
  isNavListOpen,
  title,
  onNavListToggle,
}) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy | number | null>(null);
  const reportTableRef = useRef(null);
  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const apiConstants = useApiConstants();

  const { data, loading, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      currencyType,
    },
  });

  const contacts = useMemo(() => {
    return data?.fourteenMonthReport?.currencyGroups?.flatMap(
      (currencyGroup) => [...currencyGroup?.contacts],
    );
  }, [data?.fourteenMonthReport.currencyGroups]);

  const orderedContacts = useMemo(() => {
    if (contacts && orderBy !== null) {
      const getSortValue = (contact: Contact) =>
        (typeof orderBy === 'number'
          ? contact['months']?.[orderBy]['total'].toString()
          : contact[orderBy]?.toString()) ?? contact.name;

      return contacts.sort((a, b) => {
        const compare = getSortValue(a)?.localeCompare(
          getSortValue(b),
          undefined,
          {
            numeric: true,
          },
        );

        return order === 'asc' ? compare : -compare;
      });
    } else {
      return contacts;
    }
  }, [contacts, order, orderBy]);

  const handleExpandToggle = (): void => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handlePrint = useReactToPrint({
    content: () => reportTableRef.current,
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderBy | number,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const csvData = useMemo(() => {
    if (!contacts) return [];

    const months =
      data?.fourteenMonthReport.currencyGroups[0]?.totals.months ?? [];

    const csvHeaders = [
      [t('Currency'), data?.fourteenMonthReport.salaryCurrency],
      [
        t('Partner'),
        t('Status'),
        t('Pledge Amount'),
        t('Pledge Currency'),
        t('Pledge Frequency'),
        t('Pledged Monthly Equivalent'),
        t('In Hand Monthly Equivalent'),
        t('Missing In Hand Monthly Equivalent'),
        t('In Hand One Time Gifts'),
        ...months.map(({ month }) => month),
        t('Total (last month excluded from total)'),
      ],
    ];

    const csvBody = [
      ...contacts.map((contact) => {
        const numMonthsforMonthlyEquivalent = Math.max(
          4,
          parseInt(contact.pledgeFrequency ?? '4'),
        );

        const pledgedMonthlyEquivalent =
          contact.status === 'Partner - Financial' &&
          contact.pledgeAmount &&
          contact.pledgeFrequency
            ? Math.round(
                contact.pledgeAmount / parseFloat(contact.pledgeFrequency),
              )
            : '';

        const inHandMonthlyEquivalent =
          contact.status === 'Partner - Financial' &&
          contact.pledgeFrequency &&
          contact.months
            ? Math.round(
                contact.months
                  ?.slice(15 - numMonthsforMonthlyEquivalent - 1, 15 - 1)
                  .reduce((sum, month) => sum + month.total, 0) /
                  numMonthsforMonthlyEquivalent,
              )
            : '';

        return [
          contact.name,
          contact.status ?? '',
          contact.pledgeAmount ?? '',
          contact.pledgeCurrency ?? '',
          apiConstants?.pledgeFrequencies?.find(
            ({ key }) => key === contact.pledgeFrequency,
          )?.value ?? '',
          pledgedMonthlyEquivalent,
          inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
            ? Math.min(pledgedMonthlyEquivalent, inHandMonthlyEquivalent)
            : '',
          inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
            ? -Math.max(0, pledgedMonthlyEquivalent - inHandMonthlyEquivalent)
            : '',
          inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
            ? Math.max(0, inHandMonthlyEquivalent - pledgedMonthlyEquivalent) *
              numMonthsforMonthlyEquivalent
            : Math.round(contact.total),
          ...(contact?.months?.map((month) => Math.round(month.total)) || []),
          Math.round(contact.total),
        ];
      }),
    ];

    const csvTotals = [
      t('Totals'),
      '',
      '',
      '',
      '',
      csvBody.reduce(
        (sum, row) => sum + (typeof row[5] === 'number' ? row[5] : 0),
        0,
      ),
      csvBody.reduce(
        (sum, row) => sum + (typeof row[6] === 'number' ? row[6] : 0),
        0,
      ),
      csvBody.reduce(
        (sum, row) => sum + (typeof row[7] === 'number' ? row[7] : 0),
        0,
      ),
      csvBody.reduce(
        (sum, row) => sum + (typeof row[8] === 'number' ? row[8] : 0),
        0,
      ),
      ...months.map(({ total }) => Math.round(total)),
      months
        .map(({ total }) => Math.round(total))
        .reduce((sum, monthTotal) => sum + monthTotal, 0),
    ];

    return [...csvHeaders, ...csvBody, csvTotals];
  }, [apiConstants, contacts]);

  return (
    <Box>
      <Header
        csvData={csvData}
        currencyType={currencyType}
        isExpanded={isExpanded}
        isMobile={isMobile}
        isNavListOpen={isNavListOpen}
        onExpandToggle={handleExpandToggle}
        onNavListToggle={onNavListToggle}
        onPrint={() => handlePrint && handlePrint()}
        title={title}
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingFourteenMonthReport" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : contacts && contacts.length > 0 ? (
        <Table
          isExpanded={isExpanded}
          onRequestSort={handleRequestSort}
          order={order}
          orderBy={orderBy}
          orderedContacts={orderedContacts}
          ref={reportTableRef}
          salaryCurrency={data?.fourteenMonthReport.salaryCurrency}
          totals={data?.fourteenMonthReport.currencyGroups[0].totals}
        />
      ) : (
        <EmptyReport
          title={t(
            'You have received no donations in the last thirteen months',
          )}
          subTitle={t(
            'You can setup an organization account to import them or add a new donation.',
          )}
        />
      )}
    </Box>
  );
};
