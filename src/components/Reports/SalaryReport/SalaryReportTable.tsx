/* eslint-disable import/no-unresolved */
import React, { ChangeEvent, useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Box,
  colors,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  FourteenMonthReportContact,
  FourteenMonthReportCurrencyType,
  // eslint-disable-next-line import/extensions
} from 'graphql/types.generated';
import { useFourteenMonthReportQuery } from 'pages/accountLists/[accountListId]/reports/graphql/GetReportFourteenMonth.generated';

interface Props {
  accountListId: string;
}

const applyPagination = (
  contacts: FourteenMonthReportContact[],
  page: number,
  limit: number,
) => {
  return contacts.slice(page * limit, page * limit + limit);
};

export const SalaryReportTable: React.FC<Props> = ({ accountListId }) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<FourteenMonthReportContact[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  const { data, loading, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      currencyType: FourteenMonthReportCurrencyType.Salary,
    },
  });

  const currencyGroups = data?.fourteenMonthReport.currencyGroups;

  useEffect(() => {
    if (currencyGroups) {
      setContacts(_.flatten(_.map(currencyGroups, 'contacts')));
    }
  }, [currencyGroups]);

  const renderLoading = () => (
    <TableRow>
      <TableCell colSpan={16}>
        <Box
          height="100%"
          alignItems="center"
          justifyContent="center"
          bgcolor={colors.green[600]}
        >
          Loading
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderEmpty = () => (
    <TableRow>
      <TableCell colSpan={16}>No Data</TableCell>
    </TableRow>
  );

  const renderError = () => (
    <TableRow>
      <TableCell colSpan={16}>
        <Box bgcolor={colors.red[600]}>Error: {error?.toString()}</Box>
      </TableCell>
    </TableRow>
  );

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const paginatedContacts = applyPagination(contacts, page, limit);

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Partner')}</TableCell>
              {currencyGroups?.map((currencyGroup) =>
                currencyGroup.totals.months.map((month) => (
                  <TableCell key={month.month} align="center">
                    {DateTime.fromISO(month.month).toFormat('LLL')}
                  </TableCell>
                )),
              )}
              <TableCell align="right">{t('Total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error && renderError()}
            {loading
              ? renderLoading()
              : !(currencyGroups && currencyGroups.length > 0)
              ? renderEmpty()
              : paginatedContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    {contact.months?.map((month) => (
                      <TableCell key={month.month} align="center">
                        {Math.round(month.salaryCurrencyTotal)}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      {Math.round(contact.total)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={contacts.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};
