import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { useEffectivePaycheckDate } from '../Shared/useEffectivePaycheckDate';

export const StaffInfoSummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { data: userData } = useGetUserQuery();

  const name =
    hcmUser &&
    `${hcmUser.staffInfo.preferredName} ${hcmUser.staffInfo.lastName}`;
  const spouseName =
    hcmSpouse &&
    `${hcmSpouse.staffInfo.preferredName} ${hcmSpouse.staffInfo.lastName}`;
  const fullNames = spouseName
    ? t('{{ name }} and {{ spouseName }}', { name, spouseName })
    : name;

  const effectiveDate = useEffectivePaycheckDate();
  const submittedDate = calculation?.submittedAt
    ? dateFormatShort(DateTime.fromISO(calculation.submittedAt), locale)
    : null;

  return (
    <StepCard>
      <CardHeader title={t('Staff Info Summary')} />
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell scope="row">{t('Staff Account Number')}</TableCell>
              <TableCell>{userData?.user.staffAccountId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('Full Names')}</TableCell>
              <TableCell>{fullNames}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('Phone Number')}</TableCell>
              <TableCell>{hcmUser?.staffInfo.primaryPhoneNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('Email Address')}</TableCell>
              <TableCell>
                <div>{hcmUser?.staffInfo.emailAddress}</div>
                <div>{hcmSpouse?.staffInfo.emailAddress}</div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                {t('Effective for Paycheck Dated')}
              </TableCell>
              <TableCell>{effectiveDate}</TableCell>
            </TableRow>
            {calculation?.status === SalaryRequestStatusEnum.Pending && (
              <TableRow>
                <TableCell scope="row">{t('Date Submitted')}</TableCell>
                <TableCell>{submittedDate}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};
