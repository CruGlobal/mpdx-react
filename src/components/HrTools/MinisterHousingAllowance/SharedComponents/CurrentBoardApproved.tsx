import { useRouter } from 'next/router';
import { HomeSharp } from '@mui/icons-material';
import {
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { useDuplicateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  HcmData,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';
import { MHARequest } from './types';

// HCM can keep an old board approved date on a record whose amount is now 0
const hcmApprovedOn = (amount: number | null, hcmData: HcmData | null) =>
  (amount ?? 0) > 0 ? hcmData?.mhaRequest.boardApprovedOnDate : null;

interface DateLineProps {
  label: string;
  date?: string | null;
}

// Shows a skeleton while the date is still loading
const DateLine: React.FC<DateLineProps> = ({ label, date }) => {
  const locale = useLocale();

  return (
    <Grid>
      <Typography sx={{ color: 'text.secondary' }}>
        {label}:{' '}
        {date ? (
          dateFormatShort(DateTime.fromISO(date), locale)
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
  );
};

interface PersonRowProps {
  name: string;
  approvedAmount: number | null;
  approvedOn?: string | null;
  showApprovedOn: boolean;
  takenAmount: number | null;
  lastUpdated: string | null;
  showLastUpdated: boolean;
}

const PersonRow: React.FC<PersonRowProps> = ({
  name,
  approvedAmount,
  approvedOn,
  showApprovedOn,
  takenAmount,
  lastUpdated,
  showLastUpdated,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const formatAmount = (amount: number | null) =>
    currencyFormat(Number(amount), 'USD', locale, {
      showTrailingZeros: true,
    });

  return (
    <TableRow>
      <TableCell sx={{ fontSize: 20 }}>{name}</TableCell>
      <TableCell>
        <Grid container direction="column">
          <Grid>
            <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {formatAmount(approvedAmount)}
            </Typography>
          </Grid>
          {showApprovedOn && (
            <DateLine label={t('Approved on')} date={approvedOn} />
          )}
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container direction="column">
          <Grid>
            <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {formatAmount(takenAmount)}
            </Typography>
          </Grid>
          {showLastUpdated && (
            <DateLine label={t('Last updated')} date={lastUpdated} />
          )}
        </Grid>
      </TableCell>
    </TableRow>
  );
};

interface CurrentBoardApprovedProps {
  request: MHARequest | null;
  hasOpenRequest: boolean;
}

export const CurrentBoardApproved: React.FC<CurrentBoardApprovedProps> = ({
  request,
  hasOpenRequest,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const router = useRouter();

  const [duplicateMHA] = useDuplicateMinistryHousingAllowanceRequestMutation();

  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userApprovedOverallAmount,
    spouseApprovedOverallAmount,
    userTakenAmount,
    spouseTakenAmount,
    userHcmData,
    spouseHcmData,
    userEligibleForMHA,
    spouseEligibleForMHA,
  } = useMinisterHousingAllowance();
  const requestId = request?.id;

  // MHAs approved before the MPDX launch only exist in HCM, so there is no
  // request to view, print, or duplicate
  const isHcmOnly = !request;
  // Like the Salary Calculator, an HCM-only card skips ineligible people; the
  // page shows the eligibility table instead
  const showUserRow = !isHcmOnly || userEligibleForMHA;
  const showSpouseRow = isMarried && (!isHcmOnly || spouseEligibleForMHA);

  const { hrApprovedAt } = request?.requestAttributes || {};
  const userApprovedOn = isHcmOnly
    ? hcmApprovedOn(userApprovedOverallAmount, userHcmData)
    : hrApprovedAt;
  const spouseApprovedOn = isHcmOnly
    ? hcmApprovedOn(spouseApprovedOverallAmount, spouseHcmData)
    : hrApprovedAt;

  const lastUpdated = request?.updatedAt ?? null;

  const viewLink = getRequestUrl(accountListId, requestId, 'view');

  const handleDuplicateRequest = async () => {
    if (!requestId) {
      return;
    }

    await duplicateMHA({
      variables: {
        input: {
          requestId: requestId,
        },
      },
      onCompleted: (data) => {
        const newRequestId =
          data?.duplicateMinistryHousingAllowanceRequest
            ?.ministryHousingAllowanceRequest.id;

        if (newRequestId) {
          router.push(getRequestUrl(accountListId, newRequestId, 'edit'));
        }
      },
      // Global Apollo error link surfaces the snackbar, this only prevents an unhandled promise rejection
      onError: () => {},
    });
  };

  const handlePrint = async () => {
    if (!requestId) {
      return;
    }
    await router.push(getRequestUrl(accountListId, requestId, 'view'));
    setTimeout(() => window.print(), 500);
  };

  return (
    <StatusCard
      formType={t('MHA Request')}
      title={t('Current Board Approved MHA')}
      subtitle={t("Minister's Housing Allowance Status")}
      icon={HomeSharp}
      iconColor="success.main"
      linkOneText={t('View Current MHA')}
      linkOne={viewLink}
      linkTwoText={t('Update Current MHA')}
      handleLinkTwo={handleDuplicateRequest}
      hideLinkTwoButton={hasOpenRequest}
      isRequest={false}
      hidePrint={isHcmOnly}
      hideActions={isHcmOnly}
      handlePrint={handlePrint}
      styling={{ p: 0 }}
    >
      <TableContainer sx={{ padding: 0 }}>
        <Table
          sx={{
            '& .MuiTableRow-root:last-child td': {
              border: 0,
            },
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('Spouse')}
              </TableCell>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('MHA Approved by Board')}
              </TableCell>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('MHA Claimed in Salary')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showUserRow && (
              <PersonRow
                name={preferredName}
                approvedAmount={userApprovedOverallAmount}
                approvedOn={userApprovedOn}
                showApprovedOn={!isHcmOnly || !!userApprovedOn}
                takenAmount={userTakenAmount}
                lastUpdated={lastUpdated}
                showLastUpdated={!isHcmOnly}
              />
            )}
            {showSpouseRow && (
              <PersonRow
                name={spousePreferredName ? spousePreferredName : 'N/A'}
                approvedAmount={spouseApprovedOverallAmount}
                approvedOn={spouseApprovedOn}
                showApprovedOn={!isHcmOnly || !!spouseApprovedOn}
                takenAmount={spouseTakenAmount}
                lastUpdated={lastUpdated}
                showLastUpdated={!isHcmOnly}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StatusCard>
  );
};
