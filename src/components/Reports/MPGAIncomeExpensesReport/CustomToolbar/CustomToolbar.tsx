import { FilterList, SaveAlt, ViewColumn } from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { GridToolbarProps } from '@mui/x-data-grid/internals';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { DataFields } from '../mockData';

type CustomToolbarProps = Partial<GridToolbarProps> & {
  data?: DataFields[];
  type?: ReportTypeEnum;
};

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  data,
  type,
  ...rest
}) => {
  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'left' }} {...rest}>
      <ColumnsPanelTrigger
        render={
          <ToolbarButton
            render={<Button startIcon={<ViewColumn />}>Columns</Button>}
          />
        }
      />
      <FilterPanelTrigger
        render={
          <ToolbarButton
            render={<Button startIcon={<FilterList />}>Filters</Button>}
          />
        }
      />
      <Button
        startIcon={<SaveAlt />}
        onClick={() => {
          exportToCsv(data ?? [], type ?? ReportTypeEnum.Income);
        }}
      >
        Export
      </Button>
    </Toolbar>
  );
};
