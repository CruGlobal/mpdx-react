import React from 'react';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

interface AccountInfoCardProps {
  name: string;
  accountNumber: string;
  primaryAccountBalance: number;
  remainingAllowableSalary: number;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  name,
  accountNumber,
  primaryAccountBalance,
  remainingAllowableSalary,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();

  return (
    <Card sx={{ my: theme.spacing(4) }}>
      <StyledCardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {accountNumber}
            </Typography>
          </Box>
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <ImportExportIcon
                fontSize="small"
                color="action"
                sx={{ transform: 'rotate(90deg)' }}
              />
              <Link
                href="#"
                variant="body1"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement navigation or modal
                }}
              >
                {t('Request additional salary from jane')}
              </Link>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('Up to her remaining allowable salary of $12,200')}
            </Typography>
          </Box>
        </Box>
      </StyledCardContent>

      <Divider />

      <StyledCardContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: theme.spacing(1),
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              {t('Primary Account Balance')}
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={theme.palette.primary.main}
            >
              {currencyFormat(primaryAccountBalance, 'USD', locale)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              {t('Your Remaining Allowable Salary')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={theme.palette.primary.main}
              >
                {currencyFormat(remainingAllowableSalary, 'USD', locale)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </StyledCardContent>
    </Card>
  );
};
