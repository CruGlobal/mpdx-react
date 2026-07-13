import { FilterListOff, Settings } from '@mui/icons-material';
import { ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Filters } from '../SettingsDialog/SettingsDialog';
import { StyledFilterButton } from '../SettingsDialog/StyledFilterButton';

interface SettingsButtonGroupProps {
  isFilterDateSelected: boolean;
  setFilters: (filters: Filters | null) => void;
  handleSettingsClick: () => void;
}

export const SettingsButtonGroup: React.FC<SettingsButtonGroupProps> = ({
  isFilterDateSelected,
  setFilters,
  handleSettingsClick,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup aria-label={t('Report settings button group')}>
      {isFilterDateSelected && (
        <StyledFilterButton
          variant="outlined"
          startIcon={<FilterListOff />}
          size="small"
          onClick={() => {
            setFilters(null);
          }}
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          {t('Clear')}
        </StyledFilterButton>
      )}
      <StyledFilterButton
        variant="outlined"
        startIcon={<Settings />}
        size="small"
        onClick={handleSettingsClick}
      >
        {t('Report Settings')}
      </StyledFilterButton>
    </ButtonGroup>
  );
};
