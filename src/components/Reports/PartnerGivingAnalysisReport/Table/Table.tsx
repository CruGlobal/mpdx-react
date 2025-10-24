import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import {
  GridColDef,
  GridFooterContainer,
  GridPagination,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PartnerGivingAnalysisContact } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { usePopulateTableRows } from 'src/hooks/usePopulateTableRows';
import { TableData, getLocalizedStatus } from '../Helper/tableData';
import { PartnerGivingAnalysisQuery } from '../PartnerGivingAnalysis.generated';
import { StyledDataGrid } from '../styledComponenets/StyledDataGrid';

export type RenderCell = GridColDef<PartnerGivingAnalysisContact>['renderCell'];

type Row = PartnerGivingAnalysisQuery['partnerGivingAnalysis']['nodes'][number];

export interface PartnerGivingAnalysisTableProps {
  data: Row[];
  totalCount: number;
  onSelectOne: (contactId: string) => void;
  isRowChecked: (id: string) => boolean;
  paginationModel?: GridPaginationModel;
  handlePageChange?: (model: GridPaginationModel) => void;
  sortModel?: GridSortModel;
  handleSortChange?: (model: GridSortModel) => void;
}

export const CreateTableRow = (data: Row): TableData => ({
  id: data.id,
  name: data.name ?? '',
  status: data.status ? getLocalizedStatus(data.status) : null,
  pledgeAmount: data.pledgeAmount ?? 0,
  donationPeriodSum: data.donationPeriodSum,
  donationPeriodCount: data.donationPeriodCount,
  donationPeriodAverage: data.donationPeriodAverage,
  lastDonationAmount: data.lastDonationAmount,
  lastDonationDate: data.lastDonationDate,
  totalDonations: data.totalDonations,
  pledgeCurrency: data.pledgeCurrency,
  lastDonationCurrency: data.lastDonationCurrency,
});

const CustomFooter: React.FC = () => {
  return (
    <GridFooterContainer>
      <Box sx={{ ml: 0 }}>
        <GridPagination />
      </Box>
    </GridFooterContainer>
  );
};

export const PartnerGivingAnalysisTable: React.FC<
  PartnerGivingAnalysisTableProps
> = ({
  data,
  totalCount,
  onSelectOne,
  isRowChecked,
  paginationModel,
  handlePageChange,
  sortModel,
  handleSortChange,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const tableRows = useMemo(
    () => data.map((contact) => CreateTableRow(contact)),
    [data],
  );

  const {
    checkbox,
    name,
    status,
    pledgeAmount,
    donationPeriodSum,
    donationPeriodCount,
    donationPeriodAverage,
    lastDonationAmount,
    lastDonationDate,
    totalDonations,
  } = usePopulateTableRows(locale, onSelectOne, isRowChecked);

  const columns: GridColDef[] = [
    {
      field: 'checkbox',
      headerName: '',
      width: 40,
      renderCell: checkbox,
    },
    {
      field: 'name',
      headerName: t('Name'),
      width: 240,
      renderCell: name,
    },
    {
      field: 'status',
      headerName: t('Status'),
      width: 180,
      renderCell: status,
    },
    {
      field: 'pledgeAmount',
      headerName: t('Commitment Amount'),
      width: 160,
      renderCell: pledgeAmount,
    },
    {
      field: 'donationPeriodSum',
      headerName: t('Gift Total'),
      width: 130,
      renderCell: donationPeriodSum,
    },
    {
      field: 'donationPeriodCount',
      headerName: t('Gift Count'),
      width: 90,
      renderCell: donationPeriodCount,
    },
    {
      field: 'donationPeriodAverage',
      headerName: t('Gift Average'),
      width: 150,
      renderCell: donationPeriodAverage,
    },
    {
      field: 'lastDonationAmount',
      headerName: t('Last Gift Amount'),
      width: 150,
      renderCell: lastDonationAmount,
    },
    {
      field: 'lastDonationDate',
      headerName: t('Last Gift Date'),
      width: 130,
      renderCell: lastDonationDate,
    },
    {
      field: 'totalDonations',
      headerName: t('Lifetime Total'),
      width: 130,
      renderCell: totalDonations,
    },
  ];

  return (
    <Box
      sx={{
        height: 'calc(100vh - 240px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <StyledDataGrid
        rows={tableRows}
        rowCount={totalCount}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['asc', 'desc']}
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePageChange}
        paginationMode="server"
        sortingMode="server"
        pagination
        disableRowSelectionOnClick
        disableVirtualization
        disableColumnFilter
        disableColumnMenu
        slots={{
          footer: CustomFooter,
        }}
      />
    </Box>
  );
};
