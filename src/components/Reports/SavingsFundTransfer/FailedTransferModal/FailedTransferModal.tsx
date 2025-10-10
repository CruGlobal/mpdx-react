import {
  Avatar,
  Chip,
  DialogActions,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CancelButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { chipStyle } from '../Table/Row/createTableRowHelper';
import { StatusEnum, Transfers } from '../mockData';

interface FailedTransfers {
  amount: number;
  status: StatusEnum;
  transferDate: DateTime | undefined;
}

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
    if (transfer.missingMonths) {
      transfer.missingMonths.forEach((month) => {
        results.push({
          amount: transfer.baseAmount || 0,
          status: StatusEnum.Failed,
          transferDate: month,
        });
      });
    }
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose}>{t('Close')}</CancelButton>
      </DialogActions>
    </Modal>
  );
};
