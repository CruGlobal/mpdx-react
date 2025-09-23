import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Fund } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { ReportsStaffExpensesQuery } from '../GetStaffExpense.generated';

interface PrintHeaderProps {
  icon: React.ComponentType;
  iconBgColor: string;
  fund: string;
  data: ReportsStaffExpensesQuery['reportsStaffExpenses'] | undefined;
  transferTotals: Record<Fund['fundType'], { in: number; out: number }>;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  icon: Icon,
  iconBgColor,
  fund,
  data,
  transferTotals,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
        mb={1}
      >
        <Box
          sx={{
            backgroundColor: iconBgColor || 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media print': {
              color: iconBgColor,
            },
          }}
        >
          <Icon />
        </Box>
        <Typography sx={{ fontSize: '30px' }}>{fund.toUpperCase()}</Typography>
      </Box>
      <Box display="flex" flexDirection="row" gap={4} mb={2}>
        <Box>
          <Typography>
            {t('Starting Balance: ${{balance}}', {
              balance: data?.startBalance
                ? data.startBalance.toLocaleString(locale)
                : '0',
            })}
          </Typography>
          <Typography>
            {t('Ending Balance: ${{balance}}', {
              balance: data?.endBalance
                ? data.endBalance.toLocaleString(locale)
                : '0',
            })}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {t('+ Transfers in: ${{transfersIn}}', {
              transfersIn:
                transferTotals[fund]?.in.toLocaleString(locale) ?? '0',
            })}
          </Typography>
          <Typography>
            {t('- Transfers out: ${{transfersOut}}', {
              transfersOut:
                Math.abs(transferTotals[fund]?.out).toLocaleString(locale) ??
                '0',
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
