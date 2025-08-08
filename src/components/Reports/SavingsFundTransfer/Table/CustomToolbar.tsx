import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Divider, Tooltip } from '@mui/material';
import Badge from '@mui/material/Badge';
import {
  ColumnsPanelTrigger,
  ExportCsv,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { downloadCSV } from '../DownloadTable/downloadTable';
import { TransferHistory } from '../mockData';

interface CustomToolbarProps {
  history?: TransferHistory[];
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  history = [],
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Toolbar>
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
        sx={{ mx: 0.5 }}
      />

      <Tooltip title="Download as CSV">
        <ExportCsv
          onClick={() => downloadCSV(t, history, locale)}
          render={<ToolbarButton />}
        >
          <FileDownloadIcon fontSize="small" color="primary" />
        </ExportCsv>
      </Tooltip>
    </Toolbar>
  );
};
