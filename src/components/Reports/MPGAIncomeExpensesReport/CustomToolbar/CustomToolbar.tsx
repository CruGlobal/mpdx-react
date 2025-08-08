import { FilterList, SaveAlt, ViewColumn } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { GridToolbarProps } from '@mui/x-data-grid/internals';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { TableCardHead } from '../Tables/TableCardHead';
import { DataFields } from '../mockData';

type CustomToolbarProps = Partial<GridToolbarProps> & {
  data?: DataFields[];
  months?: string[];
  type?: ReportTypeEnum;
};

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  data,
  months,
  type,
  ...rest
}) => {
  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'left' }} {...rest}>
      <ColumnsPanelTrigger
        render={
          <ToolbarButton
            render={
              <Tooltip title="Columns">
                <IconButton sx={{ color: '#05699B' }}>
                  <ViewColumn />
                </IconButton>
              </Tooltip>
            }
          />
        }
      />
      <FilterPanelTrigger
        render={
          <ToolbarButton
            render={
              <Tooltip title="Filter">
                <IconButton sx={{ color: '#05699B' }}>
                  <FilterList />
                </IconButton>
              </Tooltip>
            }
          />
        }
      />
      <Tooltip title="Export">
        <IconButton
          sx={{ color: '#05699B' }}
          onClick={() => {
            exportToCsv(data ?? [], type ?? ReportTypeEnum.Income);
          }}
        >
          <SaveAlt />
        </IconButton>
      </Tooltip>
      <Box mb={2}>
        <TableCardHead months={months!} />
      </Box>
    </Toolbar>
  );
};
