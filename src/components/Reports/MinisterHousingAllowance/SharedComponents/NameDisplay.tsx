import { Box, Card, Typography } from '@mui/material';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const NameDisplay: React.FC = () => {
  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userHcmData,
    spouseHcmData,
  } = useMinisterHousingAllowance();
  const personNumber = userHcmData?.staffInfo?.personNumber ?? '';
  const spousePersonNumber = spouseHcmData?.staffInfo?.personNumber ?? '';
  const lastName = userHcmData?.staffInfo?.lastName ?? '';
  const spouseLastName = spouseHcmData?.staffInfo?.lastName ?? '';

  const names = isMarried
    ? `${preferredName} ${lastName} and ${spousePreferredName} ${spouseLastName}`
    : `${preferredName} ${lastName}`;
  const personNumbers = isMarried
    ? `${personNumber} and ${spousePersonNumber}`
    : personNumber;

  return (
    <Box sx={{ mt: 2 }}>
      <Card
        variant="outlined"
        sx={{ padding: 2, marginBottom: 2, boxShadow: 1 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">{names}</Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {personNumbers}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
