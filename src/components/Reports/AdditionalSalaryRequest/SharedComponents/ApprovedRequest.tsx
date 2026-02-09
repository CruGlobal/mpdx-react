import { AttachMoney } from '@mui/icons-material';
import { Grid, Skeleton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

interface ApprovedRequestProps {
  request: NonNullable<
    AdditionalSalaryRequestQuery['latestAdditionalSalaryRequest']
  >;
}

export const ApprovedRequest: React.FC<ApprovedRequestProps> = ({
  request,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { user, spouse, setPageType } = useAdditionalSalaryRequest();
  const preferredName = user?.staffInfo?.preferredName;
  const spousePreferredName = spouse?.staffInfo?.preferredName;
  const { totalAdditionalSalaryRequested, usingSpouseSalary, approvedAt } =
    request;

  return (
    <StatusCard
      formType={t('ASR Request')}
      title={t("{{preferredName}}'s Approved Additional Salary Request", {
        preferredName,
      })}
      icon={AttachMoney}
      iconColor="success.main"
      linkOneText={t('View Current ASR')}
      onLinkOneClick={() => setPageType(PageEnum.View)}
      linkTwoText={t("Duplicate Last Year's ASR")}
      linkTwo=""
      isRequest={false}
      handleConfirmCancel={() => {}}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t('APPROVAL DATE')}:{' '}
            {approvedAt ? (
              dateFormatShort(DateTime.fromISO(approvedAt), locale)
            ) : (
              <Skeleton
                width={100}
                variant="text"
                sx={{ ml: 1 }}
                style={{ display: 'inline-block' }}
              />
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography
            variant="h3"
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            {currencyFormat(
              totalAdditionalSalaryRequested || 0,
              currency,
              locale,
              {
                showTrailingZeros: true,
              },
            )}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">{preferredName}</Typography>
            </Grid>
            <Grid item xs={6}>
              {usingSpouseSalary && (
                <Typography variant="body1">{spousePreferredName}</Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StatusCard>
  );
};
