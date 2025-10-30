import { useRouter } from 'next/router';
import { ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface DirectionButtonsProps {
  handleNext?: () => void;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  handleNext,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();

  return (
    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
      <Button
        sx={{ color: 'error.light' }}
        onClick={() =>
          router.push(`/accountLists/${accountListId}/reports/housingAllowance`)
        }
      >
        <b>{t('CANCEL')}</b>
      </Button>
      <Button variant="contained" color="primary" onClick={handleNext}>
        {t('CONTINUE')}
        <ChevronRight sx={{ ml: 1 }} />
      </Button>
    </Box>
  );
};
