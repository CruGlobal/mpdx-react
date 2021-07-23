import React, { useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Theme, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { FourteenMonthReportCurrencyType } from '../../../../graphql/types.generated';
import { FourteenMonthReportHeader as Header } from './Layout/Header/Header';
import type { CurrencyType } from './Layout/Header/Actions/Actions';
import { useFourteenMonthReportQuery } from './GetFourteenMonthReport.generated';
import type {
  Contact,
  Order,
  OrderBy,
} from './Layout/Table/TableHead/TableHead';
import { FourteenMonthReportTable as Table } from './Layout/Table/Table';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  currencyType: CurrencyType;
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

  const { data, loading, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      currencyType:
        currencyType === 'salary'
          ? FourteenMonthReportCurrencyType.Salary
          : FourteenMonthReportCurrencyType.Donor,
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

    const monthsTitleArray = (type: 'month' | 'total') => {
      if (data) {
        return data.fourteenMonthReport.currencyGroups[0]?.totals.months.map(
          (month) => month[type],
        );
      } else {
        return [];
      }
    };
    return [
      [t('Currency'), data?.fourteenMonthReport.salaryCurrency],
      [t('Partner'), ...monthsTitleArray('month'), t('Total')],
      ...contacts.map((contact) => [
        contact.name,
        ...(contact?.months?.map((month) => month.total) || []),
        contact.total,
      ]),
      [t('Totals'), ...monthsTitleArray('total')],
    ];
  }, [contacts]);

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
