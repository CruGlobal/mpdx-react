import NextLink from 'next/link';
import React, { FC } from 'react';
import {
  Checkbox,
  Link,
  Table,
  TableBody,
  TableCell as TableCellMui,
  TableContainer,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { Contact } from '../PartnerGivingAnalysisReport';
import { PartnerGivingAnalysisReportTableHead as TableHead } from './TableHead/TableHead';
import type { Order } from '../../Reports.type';

interface PartnerGivingAnalysisReportTableProps {
  onSelectOne: (contactId: string) => void;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
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

export const PartnerGivingAnalysisReportTable: FC<
  PartnerGivingAnalysisReportTableProps
> = ({
  order,
  orderBy,
  contacts,
  onRequestSort,
  onSelectOne,
  isRowChecked,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { buildContactUrl } = useContactPanel();

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
              // Temporary table header for partner status
              id: 'firstDonationAmount',
              label: t('Status'),
            },
            {
              // Temporary table header for commitment amount
              id: 'firstDonationAmount',
              label: t('Commitment Amount'),
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
          {contacts.map((contact) => (
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
                <Link
                  component={NextLink}
                  href={buildContactUrl(contact.id)}
                  onMouseEnter={preloadContactsRightPanel}
                  style={{
                    whiteSpace: 'nowrap',
                    marginRight: theme.spacing(0.5),
                  }}
                >
                  {contact.name}
                </Link>
              </TableCell>
              {/* Temporary table cell for partner status */}
              <TableCell>{contact.firstDonationAmount}</TableCell>
              {/* Temporary table cell for commitment amount */}
              <TableCell>
                {currencyFormat(
                  contact.firstDonationAmount ?? 0,
                  contact.pledgeCurrency,
                  locale,
                )}
              </TableCell>
              <TableCell>
                {currencyFormat(
                  contact.donationPeriodSum ?? 0,
                  contact.pledgeCurrency,
                  locale,
                )}
              </TableCell>
              <TableCell>{contact.donationPeriodCount}</TableCell>
              <TableCell>
                {currencyFormat(
                  contact.donationPeriodAverage ?? 0,
                  contact.pledgeCurrency,
                  locale,
                )}
              </TableCell>
              <TableCell>
                {currencyFormat(
                  contact.lastDonationAmount ?? 0,
                  contact.lastDonationCurrency,
                  locale,
                )}
              </TableCell>
              <TableCell>
                {dateFormatShort(
                  DateTime.fromISO(contact.lastDonationDate ?? ''),
                  locale,
                )}
              </TableCell>
              <TableCell>
                {currencyFormat(
                  contact.totalDonations ?? 0,
                  contact.pledgeCurrency,
                  locale,
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StickyTable>
    </StickyTableContainer>
  );
};
