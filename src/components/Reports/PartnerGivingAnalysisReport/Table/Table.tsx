import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import type { Contact } from '../PartnerGivingAnalysisReport';
import {
  PartnerGivingAnalysisReportTableHead as TableHead,
  PartnerGivingAnalysisReportTableHeadProps as TableHeadProps,
} from './TableHead/TableHead';

interface PartnerGivingAnalysisReportTableProps extends TableHeadProps {
  onSelectOne: (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ) => void;
  contacts: Contact[];
  selectedContacts: Array<string>;
}

const StickyTableContainer = styled(TableContainer)(() => ({
  height: 'calc(100vh - 284px)',
}));

const StickyTable = styled(Table)(({}) => ({
  height: 'calc(100vh - 96px)',
}));

export const PartnerGivingAnalysisReportTable: FC<PartnerGivingAnalysisReportTableProps> = ({
  order,
  orderBy,
  contacts,
  onRequestSort,
  onSelectAll,
  onSelectOne,
  selectedContacts,
}) => {
  const { t } = useTranslation();

  const isSelectedSome =
    selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  const isSelectedAll = selectedContacts.length === contacts.length;

  return (
    <StickyTableContainer>
      <StickyTable
        stickyHeader={true}
        aria-label="partner giving analysis report table"
        data-testid="PartnerGivingAnalysis"
      >
        <TableHead
          items={[
            {
              id: 'name',
              label: t('Name'),
            },
            {
              id: 'giftTotal',
              label: t('Gift Total'),
            },
            {
              id: 'giftCount',
              label: t('Gift Count'),
            },
            {
              id: 'giftAverage',
              label: t('Gift Average'),
            },
            {
              id: 'lastGiftAmount',
              label: t('Last Gift Amount'),
            },
            {
              id: 'lastGiftDate',
              label: t('Last Gift Date'),
            },
            {
              id: 'lifetimeTotal',
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
            const isContactSelected = selectedContacts.includes(contact.id);

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
                <TableCell>{contact.name}</TableCell>
                <TableCell align="center">{contact.giftTotal}</TableCell>
                <TableCell align="center">{contact.giftCount}</TableCell>
                <TableCell align="center">{contact.giftAverage}</TableCell>
                <TableCell align="center">{contact.lastGiftAmount}</TableCell>
                <TableCell align="center">{contact.lastGiftDate}</TableCell>
                <TableCell align="center">{contact.lifeTimeTotal}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </StickyTable>
    </StickyTableContainer>
  );
};
