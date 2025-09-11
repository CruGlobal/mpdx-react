import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Box, Divider, Tooltip } from '@mui/material';
import Badge from '@mui/material/Badge';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCardHead } from '../Tables/TableCardHead';
import { DataFields } from '../mockData';

interface CustomToolbarProps {
  data: DataFields[];
  type: ReportTypeEnum;
  months: string[];
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  data,
  type,
  months,
}) => {
  const { t } = useTranslation();

  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'left' }}>
      <Tooltip title={t('Columns')}>
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" color="primary" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title={t('Filters')}>
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton
              {...props}
              ref={props.ref as React.Ref<HTMLButtonElement>}
              color="primary"
              style={{
                gridArea: '1 / 1',
                width: 'min-content',
                height: 'min-content',
                zIndex: 1,
                transition: 'opacity 0.5s ease 0s',
              }}
            >
              <Badge
                badgeContent={state.filterCount}
                color="primary"
                variant="dot"
              >
                <FilterListIcon fontSize="small" color="primary" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5, height: 30, alignSelf: 'center' }}
      />

      <Tooltip title={t('Download as CSV')}>
        <ToolbarButton onClick={() => exportToCsv(data, type, months)}>
          <FileDownloadIcon fontSize="small" color="primary" />
        </ToolbarButton>
      </Tooltip>
      <Box mb={2}>
        <TableCardHead months={months} />
      </Box>
    </Toolbar>
  );
};
