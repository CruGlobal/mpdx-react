import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface DirectionButtonsProps {
  handleNext?: () => void;
  handleBack?: () => void;
  isCalculate?: boolean;
}

export const DirectionButtons: React.FC<DirectionButtonsProps> = ({
  handleNext,
  handleBack,
  isCalculate,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();

  //TODO: handle submit logic

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
      {isCalculate ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.400',
              },
            }}
            onClick={handleBack}
          >
            <ChevronLeft sx={{ mr: 1 }} />
            <b>{t('Back')}</b>
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {t('Submit')}
            <ChevronRight sx={{ ml: 1 }} />
          </Button>
        </Box>
      ) : (
        <Button variant="contained" color="primary" onClick={handleNext}>
          {t('CONTINUE')}
          <ChevronRight sx={{ ml: 1 }} />
        </Button>
      )}
    </Box>
  );
};
