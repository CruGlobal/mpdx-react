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
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactLinks } from 'src/hooks/useContactLinks';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { PartnerGivingAnalysisReportTableHead as TableHead } from './TableHead/TableHead';
import type { Order } from '../../Reports.type';
import type { Contact } from '../PartnerGivingAnalysisReport';

interface PartnerGivingAnalysisReportTableProps {
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
  const accountListId = useAccountListId();
  const { getContactUrl } = useContactLinks({
    url: `/accountLists/${accountListId}/reports/partnerGivingAnalysis/`,
  });

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
            const contactUrl = getContactUrl(contact.id);
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
                  <NextLink href={contactUrl} passHref>
                    <Link
                      component="a"
                      onMouseEnter={preloadContactsRightPanel}
                      style={{
                        whiteSpace: 'nowrap',
                        marginRight: theme.spacing(0.5),
                      }}
                    >
                      {contact.name}
                    </Link>
                  </NextLink>
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
