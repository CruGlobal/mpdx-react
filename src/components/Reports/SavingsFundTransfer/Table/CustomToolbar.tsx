import { SaveAlt } from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { downloadCSV } from '../DownloadTable/downloadTable';
import { mockData } from '../mockData';

export const CustomToolbar = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button
          size="small"
          sx={{ minHeight: 33, pt: 0, pb: 0 }}
          startIcon={<SaveAlt />}
          onClick={() => downloadCSV(t, mockData.history, locale)}
        >
          {t('Export')}
        </Button>
      </GridToolbarContainer>
      <GridToolbarQuickFilter
        sx={{
          width: 250,
          m: 1,
        }}
      />
    </GridToolbarContainer>
  );
};
