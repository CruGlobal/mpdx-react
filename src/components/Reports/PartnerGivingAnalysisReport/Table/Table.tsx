import React, { FC } from 'react';
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
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { PartnerGivingAnalysisReportTableHead as TableHead } from './TableHead/TableHead';
import type { Order } from '../../Reports.type';
import type { Contact } from '../PartnerGivingAnalysisReport';

interface PartnerGivingAnalysisReportTableProps {
  onClick: (contactId: string) => void;
  onSelectOne: (contactId: string) => void;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Contact,
  ) => void;
  contacts: Contact[];
  order: Order;
  orderBy: string | null;
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
  onSelectOne,
  isRowChecked,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <StickyTableContainer>
      <StickyTable
        stickyHeader={true}
        aria-label={t('Partner giving analysis report table')}
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
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
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
                    onChange={() => onSelectOne(contact.id)}
                    value={contact.id}
                  />
                </TableCell>
                <TableCell>
                  <ContactName
                    onClick={() => onClick(contact.id)}
                    onMouseEnter={preloadContactsRightPanel}
                  >
                    {contact.name}
                  </ContactName>
                </TableCell>
                <TableCell>
                  {currencyFormat(
                    contact.donationPeriodSum,
                    contact.pledgeCurrency,
                    locale,
                  )}
                </TableCell>
                <TableCell>{contact.donationPeriodCount}</TableCell>
                <TableCell>
                  {currencyFormat(
                    contact.donationPeriodAverage,
                    contact.pledgeCurrency,
                    locale,
                  )}
                </TableCell>
                <TableCell>
                  {currencyFormat(
                    contact.lastDonationAmount,
                    contact.lastDonationCurrency,
                    locale,
                  )}
                </TableCell>
                <TableCell>
                  {dateFormatShort(
                    DateTime.fromISO(contact.lastDonationDate),
                    locale,
                  )}
                </TableCell>
                <TableCell>
                  {currencyFormat(
                    contact.totalDonations,
                    contact.pledgeCurrency,
                    locale,
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
