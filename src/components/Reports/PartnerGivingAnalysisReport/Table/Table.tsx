import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell as TableCellMui,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Contact } from '../PartnerGivingAnalysisReport';
import type { Order } from '../../Reports.type';
import { PartnerGivingAnalysisReportTableHead as TableHead } from './TableHead/TableHead';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat/intlFormat';

interface PartnerGivingAnalysisReportTableProps {
  onClick: (contactId: string) => void;
  onSelectOne: (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Contact,
  ) => void;
  contacts: Contact[];
  //selectedContacts: Array<string>;
  order: Order;
  orderBy: string | null;
  ids: string[];
  allContactIds: string[];
  isRowChecked: (id: string) => boolean;
}

const StickyTableContainer = styled(TableContainer)(() => ({
  height: 'calc(100vh - 284px)',
}));

const StickyTable = styled(Table)(({}) => ({
  height: 'calc(100vh - 96px)',
}));

const TableCell = styled(TableCellMui)({
  fontSize: '1.15em',
  align: 'left',
});

const ContactName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  whiteSpace: 'nowrap',
  marginRight: theme.spacing(0.5),
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export const PartnerGivingAnalysisReportTable: FC<
  PartnerGivingAnalysisReportTableProps
> = ({
  order,
  orderBy,
  contacts,
  onClick,
  onRequestSort,
  onSelectAll,
  onSelectOne,
  ids,
  allContactIds,
  isRowChecked,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const formatCurrency = (amount: number, currency: string): string =>
    // Force to 2 decimal places and add separators between thousands
    Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const isSelectedSome = ids.length > 0 && ids.length < allContactIds.length;

  const isSelectedAll = ids?.length === allContactIds.length;

  return (
    <StickyTableContainer>
      <StickyTable
        stickyHeader={true}
        aria-label="partner giving analysis report table"
        data-testid="PartnerGivingAnalysisReport"
      >
        <TableHead
          items={[
            {
              id: 'name',
              label: t('Name'),
            },
            {
              id: 'donationPeriodSum',
              label: t('Gift Total'),
            },
            {
              id: 'donationPeriodCount',
              label: t('Gift Count'),
            },
            {
              id: 'donationPeriodAverage',
              label: t('Gift Average'),
            },
            {
              id: 'lastDonationAmount',
              label: t('Last Gift Amount'),
            },
            {
              id: 'lastDonationDate',
              label: t('Last Gift Date'),
            },
            {
              id: 'totalDonations',
              label: t('Lifetime Total'),
            },
          ]}
          isSelectedAll={isSelectedAll}
          isSelectedSome={isSelectedSome}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          onSelectAll={onSelectAll}
        />
        <TableBody>
          {contacts?.map((contact) => {
            return (
              <TableRow
                key={contact.id}
                hover
                data-testid="PartnerGivingAnalysisReportTableRow"
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isRowChecked(contact.id)}
                    onChange={(event) => onSelectOne(event, contact.id)}
                    value={contact.id}
                  />
                </TableCell>
                <TableCell>
                  <ContactName onClick={() => onClick(contact.id)}>
                    {contact.name}
                  </ContactName>
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    contact.donationPeriodSum,
                    contact.pledgeCurrency,
                  )}
                </TableCell>
                <TableCell>{contact.donationPeriodCount}</TableCell>
                <TableCell>
                  {formatCurrency(
                    contact.donationPeriodAverage,
                    contact.pledgeCurrency,
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    contact.lastDonationAmount,
                    contact.lastDonationCurrency,
                  )}
                </TableCell>
                <TableCell>
                  {dateFormatShort(
                    DateTime.fromISO(contact.lastDonationDate),
                    locale,
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    contact.totalDonations,
                    contact.pledgeCurrency,
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </StickyTable>
    </StickyTableContainer>
  );
};
