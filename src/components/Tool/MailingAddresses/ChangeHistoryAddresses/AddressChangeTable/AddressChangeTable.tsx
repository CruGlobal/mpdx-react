import NextLink from 'next/link';
import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Box,
  Button,
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
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { dateFormat } from 'src/lib/intlFormat';
import {
  AddressChangeRow,
  formatAddress,
  formatChangeMadeBy,
  isAutomaticChange,
} from '../helpers';

interface AddressChangeTableProps {
  addressChanges: AddressChangeRow[];
  onHistoryClick: (addressChange: AddressChangeRow) => void;
}

export const AddressChangeTable: React.FC<AddressChangeTableProps> = ({
  addressChanges,
  onHistoryClick,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { buildContactUrl } = useContactPanel();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { data: userData } = useGetUserQuery();
  const currentUserId = userData?.user.id;

  return (
    <TableContainer>
      <Table aria-label={t('Address changes')}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Date')}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Partner')}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Address')}</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{t('Made by')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {addressChanges.map((addressChange) => (
            <TableRow key={addressChange.id}>
              <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                {dateFormat(DateTime.fromISO(addressChange.date), locale)}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Link
                  component={NextLink}
                  href={buildContactUrl(addressChange.contactId)}
                  shallow
                  fontWeight="bold"
                >
                  {addressChange.partnerName}
                </Link>
                {addressChange.partnerStatus && (
                  <Typography variant="body2" color="text.secondary">
                    {getLocalizedContactStatus(addressChange.partnerStatus)}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {formatAddress(addressChange)}
                </Typography>
                {addressChange.previousAddress && (
                  <Typography variant="body2" color="text.secondary">
                    {t('Was:')}{' '}
                    <Box component="s">
                      {formatAddress(addressChange.previousAddress)}
                    </Box>
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Box display="flex" gap={1} color="text.secondary">
                  {isAutomaticChange(addressChange.source) ? (
                    <SyncIcon fontSize="small" />
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {formatChangeMadeBy(addressChange, currentUserId, t)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }} align="right">
                <Button
                  size="small"
                  onClick={() => onHistoryClick(addressChange)}
                  sx={{ fontWeight: 'bold' }}
                >
                  {t('History')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
