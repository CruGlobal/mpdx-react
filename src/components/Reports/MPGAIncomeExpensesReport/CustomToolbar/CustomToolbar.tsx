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
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCardHead } from '../Tables/TableCardHead';
import { DataFields } from '../mockData';

interface CustomToolbarProps {
  data?: DataFields[];
  type?: ReportTypeEnum;
  months?: string[];
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  data = [],
  type = ReportTypeEnum.Income,
  months = [],
}) => {
  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'left' }}>
      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" color="primary" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(_, state) => (
            <ToolbarButton
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

      <Tooltip title="Download as CSV">
        <ToolbarButton onClick={() => exportToCsv(data, type, months)}>
          <FileDownloadIcon fontSize="small" color="primary" />
        </ToolbarButton>
      </Tooltip>
      <Box mb={2}>
        <TableCardHead months={months!} />{' '}
      </Box>
    </Toolbar>
  );
};
