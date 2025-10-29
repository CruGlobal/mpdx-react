import { Box, Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PersonInfo } from '../Shared/mockData';

interface NameDisplayProps {
  isMarried: boolean;
  staff: PersonInfo;
  spouse?: PersonInfo | null;
}

export const NameDisplay: React.FC<NameDisplayProps> = ({
  isMarried,
  staff,
  spouse,
}) => {
  const { t } = useTranslation();
  const spouseName = spouse ? spouse.name.split(', ')[1] : '';
  const spouseId = spouse ? spouse.id : t('N/A');

  return (
    <Box sx={{ mt: 2 }}>
      <Card
        variant="outlined"
        sx={{ padding: 2, marginBottom: 2, boxShadow: 1 }}
      >
        {isMarried ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">{`${staff.name} and ${spouseName}`}</Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary' }}
            >{`${staff.id} and ${spouseId}`}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5">{staff.name}</Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary' }}
            >{`(${staff.id})`}</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};
