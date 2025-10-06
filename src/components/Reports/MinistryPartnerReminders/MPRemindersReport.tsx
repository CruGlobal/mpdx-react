import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Container,
  Link,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { StyledHeaderBox } from '../MPGAIncomeExpensesReport/styledComponents';
import { ScreenOnly } from '../SavingsFundTransfer/styledComponents/DisplayStyling';
import { useStaffAccountQuery } from '../StaffAccount.generated';
import { StyledPrintButton } from '../styledComponents';
import { RemindersTable } from './Table/RemindersTable';
import { mockData } from './mockData';

interface MPRemindersReportProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const MPRemindersReport: React.FC<MPRemindersReportProps> = ({
  title,
  isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();

  const { data: staffAccountData } = useStaffAccountQuery({});

  const handlePrint = () => {
    window.print();
  };

  mockData.sort((a, b) => a.partner.localeCompare(b.partner));

  return (
    <Box>
      <ScreenOnly>
        <MultiPageHeader
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
          headerType={HeaderTypeEnum.Report}
          title={title}
        />
      </ScreenOnly>
      <Box mt={2}>
        <Container>
          <StyledHeaderBox>
            <Typography variant="h4">{t('Online Reminder System')}</Typography>
            <ScreenOnly>
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
          <Box display="flex" flexDirection="row" gap={3} mb={2}>
            <Typography>{staffAccountData?.staffAccount?.name}</Typography>
            <Typography>{staffAccountData?.staffAccount?.id}</Typography>
          </Box>
        </Container>
      </Box>
      <Box>
        <Container>
          <ScreenOnly>
            <Typography variant="body1" mt={4} mb={2}>
              {t(
                'You can now change the reminder status of any of your ministry partners online! Your current list and related information is displayed below. To change the reminder status of any of your ministry partners, use the drop-down boxes in the "Change Reminder Status" column. When you\'re done click the "Save" button at the bottom of the page.',
              )}
            </Typography>
            <Typography variant="body1" mb={2}>
              {t('Wondering how the ')}
              <Typography
                variant="body1"
                sx={{ display: 'inline', fontStyle: 'italic' }}
              >
                {t('Reminder System')}
              </Typography>
              <Typography variant="body1" sx={{ display: 'inline' }}>
                {t(
                  ' works and how it differs from the Receipting System? Check out ',
                )}
                <Link
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                  }}
                  underline="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ministry Partner Reminder help
                </Link>
                .
              </Typography>
            </Typography>
          </ScreenOnly>
          <Box sx={{ mb: 4 }}>
            <RemindersTable data={mockData} />
          </Box>
          <ScreenOnly>
            <Box sx={{ mb: 4 }}>
              <Button variant="contained">{t('Save')}</Button>
            </Box>
          </ScreenOnly>
        </Container>
      </Box>
    </Box>
  );
};
