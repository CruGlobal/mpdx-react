import {
  Avatar,
  Chip,
  DialogActions,
  DialogContent,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import { CancelButton } from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { SavingsFundTransferFailureReasonCode } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { chipStyle } from '../Table/Row/createTableRowHelper';
import { StatusEnum, Transfers } from '../mockData';

interface FailedTransfers {
  amount: number;
  status: StatusEnum;
  transferDate: DateTime | undefined;
  reason?: string;
}

export const getFailureReason = (
  t: TFunction,
  reasonCode: SavingsFundTransferFailureReasonCode,
): string => {
  const reasons: Record<SavingsFundTransferFailureReasonCode, string> = {
    [SavingsFundTransferFailureReasonCode.InactiveAccount]: t(
      'The staff account was inactive.',
    ),
    [SavingsFundTransferFailureReasonCode.InsufficientFunds]: t(
      'The fund did not have enough available balance.',
    ),
    [SavingsFundTransferFailureReasonCode.MissingFundType]: t(
      'One of the funds does not exist on the staff account.',
    ),
    [SavingsFundTransferFailureReasonCode.NotAttempted]: t(
      'The retry window ended before it could go through.',
    ),
    [SavingsFundTransferFailureReasonCode.Other]: t(
      'Something went wrong while processing the transfer.',
    ),
    [SavingsFundTransferFailureReasonCode.SettledPeriod]: t(
      'The transfer date was in a period that had already closed.',
    ),
  };
  return reasons[reasonCode];
};

interface FailedTransferModalProps {
  handleClose: () => void;
  transfer: Transfers;
}

export const FailedTransferModal: React.FC<FailedTransferModalProps> = ({
  handleClose,
  transfer,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const pastTransfers: FailedTransfers[] = (() => {
    const results: FailedTransfers[] = [];
    if (transfer.summarizedTransfers) {
      transfer.summarizedTransfers.forEach((tx) => {
        results.push({
          amount: tx.baseAmount,
          status: StatusEnum.Complete,
          transferDate: tx.transaction?.transactedAt,
        });
      });
    }
    transfer.failures?.forEach((failure) => {
      results.push({
        amount: transfer.baseAmount || 0,
        status: StatusEnum.Failed,
        transferDate: failure.occurrence,
        reason: getFailureReason(t, failure.reasonCode),
      });
    });
    return results;
  })();

  const sortedTransfers = [...pastTransfers]
    .filter(
      (transfer): transfer is FailedTransfers & { transferDate: DateTime } =>
        !!transfer.transferDate && DateTime.isDateTime(transfer.transferDate),
    )
    .sort((a, b) => a.transferDate.toMillis() - b.transferDate.toMillis());

  return (
    <Modal
      title={t('Transfer History')}
      isOpen={true}
      handleClose={handleClose}
      size="md"
    >
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('Amount')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
                <TableCell>{t('Transfer Date')}</TableCell>
                <TableCell>{t('Reason')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransfers.map((transfer, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {currencyFormat(transfer.amount, 'USD', locale, {
                      showTrailingZeros: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: chipStyle[transfer.status].avatarColor,
                          }}
                        >
                          {' '}
                        </Avatar>
                      }
                      label={transfer.status}
                      color="default"
                      size="small"
                      sx={{
                        backgroundColor: chipStyle[transfer.status].chipColor,
                        boxShadow: 'none',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {transfer.transferDate.toFormat('MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{transfer.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {transfer.historyTruncated && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('Only the last year of transfer history is shown.')}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Trans t={t}>
            For more information about failed transfers, email{' '}
            <Link href="mailto:HR@cru.org">HR@cru.org</Link>.
          </Trans>
        </Typography>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose}>{t('Close')}</CancelButton>
      </DialogActions>
    </Modal>
  );
};
