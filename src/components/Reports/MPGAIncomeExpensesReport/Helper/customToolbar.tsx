import { FilterList, SaveAlt, ViewColumn } from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  ColumnsPanelTrigger,
  ExportCsv,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';

export const CustomToolbar = () => {
  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'left' }}>
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
      <ExportCsv
        render={
          <ToolbarButton
            render={<Button startIcon={<SaveAlt />}>Export</Button>}
          />
        }
      />
    </Toolbar>
  );
};
