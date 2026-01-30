import { AttachMoney } from '@mui/icons-material';
import { Grid, Skeleton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';

interface ApprovedRequestProps {
  request: NonNullable<AdditionalSalaryRequestQuery['additionalSalaryRequest']>;
}

export const ApprovedRequest: React.FC<ApprovedRequestProps> = ({
  request,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  const { user, spouse } = useAdditionalSalaryRequest();
  const preferredName = user?.staffInfo?.preferredName;
  const spousePreferredName = spouse?.staffInfo?.preferredName;
  const { id, totalAdditionalSalaryRequested, usingSpouseSalary, approvedAt } =
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
      linkOne={getRequestUrl(accountListId, id, 'view')}
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
