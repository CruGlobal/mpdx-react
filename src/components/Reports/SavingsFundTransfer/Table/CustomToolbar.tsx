import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Divider, Tooltip } from '@mui/material';
import Badge from '@mui/material/Badge';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { downloadCSV } from '../DownloadTable/downloadTable';
import { TableTypeEnum, Transfers } from '../mockData';

interface CustomToolbarProps {
  history?: Transfers[];
  type: TableTypeEnum;
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  history = [],
  type,
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
        sx={{ mx: 0.5 }}
      />

      <Tooltip title="Download as CSV">
        <ToolbarButton onClick={() => downloadCSV(t, history, type, locale)}>
          <FileDownloadIcon fontSize="small" color="primary" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
};
