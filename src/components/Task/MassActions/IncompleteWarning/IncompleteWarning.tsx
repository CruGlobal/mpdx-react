import WarningIcon from '@mui/icons-material/Warning';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface IncompleteWarningProps {
  selectedIdCount: number;
  idCount: number;
}

export const IncompleteWarning: React.FC<IncompleteWarningProps> = ({
  selectedIdCount,
  idCount,
}) => {
  const { t } = useTranslation();

  return selectedIdCount > 1000 ? (
    <Box
      sx={(theme) => ({
        paddingBottom: theme.spacing(2),
      })}
    >
      <WarningIcon sx={{ verticalAlign: 'middle' }} color="warning" />
      <Typography
        sx={(theme) => ({
          paddingLeft: theme.spacing(0.5),
        })}
        component="span"
      >
        {t(
          '{{selectedCount}} tasks are selected, but only the first {{modifyCount}} will be modified',
          {
            selectedCount: selectedIdCount,
            modifyCount: idCount,
          },
        )}
      </Typography>
    </Box>
  ) : null;
};
