import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  GlobalStyles,
  SvgIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import {
  StaffSavingFundContext,
  StaffSavingFundType,
} from '../../StaffSavingFund/StaffSavingFundContext';
import { BalanceCard } from '../BalanceCard/BalanceCard';
import { EmptyTable } from '../Table/EmptyTable';
import { PrintTable } from '../Table/PrintTable';
import { TransferHistoryTable } from '../Table/TransferHistoryTable';
import { mockData } from '../mockData';
import { PrintOnly, ScreenOnly } from '../styledComponents';

const StyledPrintButton = styled(Button)({
  border: '1px solid',
  borderRadius: theme.spacing(1),
  marginLeft: theme.spacing(2),
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
});

const StyledHeaderBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
});

interface TransfersPageProps {
  title: string;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ title }) => {
  const { t } = useTranslation();
  const { isNavListOpen, onNavListToggle } = useContext(
    StaffSavingFundContext,
  ) as StaffSavingFundType;

  const handlePrint = () => window.print();

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            'svg, .MuiSvgIcon-root': {
              display: 'inline !important',
              visibility: 'visible !important',
              width: '24px',
              height: '24px',
            },
          },
          '@page': {
            size: 'landscape',
          },
        }}
      />
      <Box>
        <ScreenOnly>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            headerType={HeaderTypeEnum.Report}
            title={title}
          />
        </ScreenOnly>
        <Box sx={{ mt: 2 }}>
          <Container>
            <StyledHeaderBox>
              <Typography variant="h4">{t('Fund Transfer')}</Typography>
              <ScreenOnly
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mt: 1,
                }}
              >
                <StyledPrintButton
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PrintIcon titleAccess={t('Print')} />
                    </SvgIcon>
                  }
                  onClick={handlePrint}
                >
                  {t('Print')}
                </StyledPrintButton>
              </ScreenOnly>
            </StyledHeaderBox>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                mb: 2,
              }}
            >
              <Typography>{mockData.accountName}</Typography>
              <Typography>{mockData.accountListId}</Typography>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {mockData.funds.map((fund) => (
                <BalanceCard
                  fund={fund}
                  key={fund.accountId}
                  handleOpenTransferModal={handleOpenTransferModal}
                />
              ))}
            </Box>
            <ScreenOnly sx={{ mt: 2, mb: 3 }}>
              <TransferHistoryTable
                history={mockData.history}
                emptyPlaceholder={
                  <EmptyTable
                    title={t('Transfer History not available')}
                    subtitle={t('No data found across any accounts.')}
                  />
                }
              />
            </ScreenOnly>
            <PrintOnly>
              <PrintTable transfers={mockData.history} />
            </PrintOnly>
          </Container>
        </Box>
      </Box>
    </>
  );
};
