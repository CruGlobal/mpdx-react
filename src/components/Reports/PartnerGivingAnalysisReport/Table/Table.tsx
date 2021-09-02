import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import {
  PartnerGivingAnalysisReportTableHead as TableHead,
  PartnerGivingAnalysisReportTableHeadProps as TableHeadProps,
} from './TableHead/TableHead';

interface PartnerGivingAnalysisReportTableProps extends TableHeadProps {
  onSelectAll: void;
  onSelectOne: void;
  orderedContacts: [];
}

const StickyTableContainer = styled(TableContainer)(() => ({
  height: 'calc(100vh - 160px)',
}));

export const PartnerGivingAnalysisReportTable: FC<PartnerGivingAnalysisReportTableProps> = ({
  order,
  orderBy,
  orderedContacts,
  onRequestSort,
}) => {
  const { t } = useTranslation();

  return (
    <StickyTableContainer>
      <Table
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
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
        <TableBody>
          {orderedContacts?.map((contact) => (
            <TableRow
              key={contact.id}
              hover
              data-testid="PartnerGivingAnalysisReportTableRow"
            >
              <TableCell>{contact.name}</TableCell>
              <TableCell align="center">{contact.giftTotal}</TableCell>
              <TableCell align="center">{contact.giftCount}</TableCell>
              <TableCell align="center">{contact.giftAverage}</TableCell>
              <TableCell align="center">{contact.lastGiftAmount}</TableCell>
              <TableCell align="center">{contact.lastGiftDate}</TableCell>
              <TableCell align="center">{contact.lifeTimeTotal}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StickyTableContainer>
  );
};
