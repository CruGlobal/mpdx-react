import { Box, GlobalStyles, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { StyledIconBox } from '../styledComponents/StyledIconBox';

interface PrintHeaderProps {
  icon: React.ComponentType;
  iconColor: string;
  startBalance: number;
  endBalance: number;
  transfersIn: number;
  transfersOut: number;
  title: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  icon: Icon,
  iconColor,
  startBalance,
  endBalance,
  transfersIn,
  transfersOut,
  title,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            '.StyledIconBox-root': {
              width: '30px',
              height: '30px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <StyledIconBox className="StyledIconBox-root" iconBgColor={iconColor}>
            <Icon />
          </StyledIconBox>
          <Typography variant="h4" mb={0}>
            {t('{{fundType}}', {
              fundType: title,
            }).toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography>
              {t('Starting Balance: {{balance}}', {
                balance: currencyFormat(startBalance, 'USD', locale, {
                  showTrailingZeros: true,
                }),
              })}
            </Typography>
            <Typography>
              {t('Ending Balance: {{balance}}', {
                balance: currencyFormat(endBalance, 'USD', locale, {
                  showTrailingZeros: true,
                }),
              })}
            </Typography>
          </Box>
          <Box>
            <Typography>
              {t('+ Transfers in: {{transfersIn}}', {
                transfersIn: currencyFormat(transfersIn, 'USD', locale, {
                  showTrailingZeros: true,
                }),
              })}
            </Typography>
            <Typography>
              {t('- Transfers out: {{transfersOut}}', {
                transfersOut: currencyFormat(
                  Math.abs(transfersOut),
                  'USD',
                  locale,
                  {
                    showTrailingZeros: true,
                  },
                ),
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};
