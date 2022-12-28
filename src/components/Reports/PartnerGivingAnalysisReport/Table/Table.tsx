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
  selectedContacts: Array<string>;
  order: Order;
  orderBy: string | null;
}

const StickyTableContainer = styled(TableContainer)(() => ({
  height: 'calc(100vh - 284px)',
}));

const StickyTable = styled(Table)(({}) => ({
  height: 'calc(100vh - 96px)',
}));

const TableCell = styled(TableCellMui)({
  fontSize: '1.15em',
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

function formatCurrency(amount: number, currency: string): string {
  // Force to 2 decimal places and add commas between thousands
  return (
    Intl.NumberFormat([], {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currency}`
  );
}

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
  selectedContacts,
}) => {
  const { t } = useTranslation();

  const isSelectedSome =
    selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  const isSelectedAll = selectedContacts?.length === contacts.length;

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
            const isContactSelected = selectedContacts?.includes(contact.id);

            return (
              <TableRow
                key={contact.id}
                hover
                data-testid="PartnerGivingAnalysisReportTableRow"
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isContactSelected}
                    onChange={(event) => onSelectOne(event, contact.id)}
                    value={isContactSelected}
                  />
                </TableCell>
                <TableCell>
                  <ContactName onClick={() => onClick(contact.id)}>
                    {contact.name}
                  </ContactName>
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(
                    contact.donationPeriodSum,
                    contact.pledgeCurrency,
                  )}
                </TableCell>
                <TableCell align="center">
                  {contact.donationPeriodCount}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(
                    contact.donationPeriodAverage,
                    contact.pledgeCurrency,
                  )}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(
                    contact.lastDonationAmount,
                    contact.lastDonationCurrency,
                  )}
                </TableCell>
                <TableCell align="center">
                  {DateTime.fromFormat(
                    contact.lastDonationDate,
                    'yyyy-MM-dd',
                  ).toLocaleString(DateTime.DATE_SHORT)}
                </TableCell>
                <TableCell align="center">
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
