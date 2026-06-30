import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { Tooltip } from '@mui/material';
import Badge from '@mui/material/Badge';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

export const CustomToolbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Toolbar
      style={{ display: 'flex', justifyContent: 'left', borderBottom: 'none' }}
    >
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
    </Toolbar>
  );
};
