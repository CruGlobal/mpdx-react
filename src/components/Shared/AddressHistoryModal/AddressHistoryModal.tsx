import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useId, useMemo } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { dateFormat } from 'src/lib/intlFormat';
import { useAddressHistoryQuery } from './AddressHistory.generated';
import {
  formatAddress,
  formatChangeMadeBy,
  isAutomaticChange,
} from './addressHistoryHelpers';
import { downloadAddressHistory } from './downloadAddressHistory';

interface AddressHistoryModalProps {
  accountListId: string;
  contactId: string;
  handleClose: () => void;
}

export const AddressHistoryModal: React.FC<AddressHistoryModalProps> = ({
  accountListId,
  contactId,
  handleClose,
}) => {
  const { t } = useTranslation();
  const titleId = useId();
  const { pathname } = useRouter();
  const onMailingAddressesPage = pathname.startsWith(
    '/accountLists/[accountListId]/tools/mailingAddresses',
  );
  const locale = useLocale();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { data: userData } = useGetUserQuery();
  const { data, loading, error, refetch } = useAddressHistoryQuery({
    variables: { accountListId, contactId },
  });
  const retry = () =>
    refetch().catch(() => {
      // Nothing to add: the error link already reports the failure, and `error` keeps the Alert up
    });

  const contact = data?.contact;
  const addresses = useMemo(
    () =>
      (contact?.addresses.nodes ?? [])
        .map((address) => ({
          ...address,
          changedAt: DateTime.fromISO(address.changeDate),
        }))
        // Newest first, in the same order the API uses to pick each contact's latest change
        .sort(
          (a, b) =>
            b.changedAt.toMillis() - a.changedAt.toMillis() ||
            DateTime.fromISO(b.createdAt).toMillis() -
              DateTime.fromISO(a.createdAt).toMillis() ||
            // Plain comparison matches Postgres' byte order for lowercase uuids
            (b.id > a.id ? 1 : b.id < a.id ? -1 : 0),
        )
        // Sorted newest first, so each address replaced the next older one
        .map((address, index, sorted) => ({
          ...address,
          previous: sorted[index + 1],
        })),
    [contact],
  );
  const primaryAddress = addresses.find(
    (address) => address.primaryMailingAddress,
  );
  const oldestChange = addresses[addresses.length - 1]?.changedAt;

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={titleId}
    >
      <DialogTitle component="div" sx={{ pr: 7 }}>
        <Typography id={titleId} variant="h6" component="h2" fontWeight="bold">
          {t('Address History')}
        </Typography>
        {contact && (
          <Typography variant="body2" color="text.secondary">
            {contact.status
              ? `${contact.name} · ${getLocalizedContactStatus(contact.status)}`
              : contact.name}
          </Typography>
        )}
      </DialogTitle>
      <IconButton
        onClick={handleClose}
        aria-label={t('Close')}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {loading && !data ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress data-testid="loading" />
          </Box>
        ) : error && !data ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={retry}>
                {t('Retry')}
              </Button>
            }
          >
            {t('Unable to load address history.')}
          </Alert>
        ) : (
          <>
            {primaryAddress && (
              <Box
                display="flex"
                gap={2}
                p={2}
                borderRadius={1}
                sx={{ backgroundColor: 'mpdxGrayLight.main' }}
              >
                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    textTransform="uppercase"
                  >
                    {t('Current primary address')}
                  </Typography>
                  <Typography>{formatAddress(primaryAddress)}</Typography>
                </Box>
              </Box>
            )}
            {oldestChange && (
              <Typography variant="body2" color="text.secondary" my={2}>
                {t('{{count}} changes since {{date}}', {
                  count: addresses.length,
                  date: oldestChange.toLocaleString(
                    { month: 'short', year: 'numeric' },
                    { locale },
                  ),
                })}
              </Typography>
            )}
            {addresses.map((address) => (
              <Box
                key={address.id}
                display="grid"
                gridTemplateColumns="110px 24px 1fr"
                columnGap={2}
                py={2}
                borderTop={1}
                borderColor="divider"
              >
                <Typography variant="body2" fontWeight="bold">
                  {dateFormat(address.changedAt, locale)}
                </Typography>
                <Box color="text.secondary">
                  {isAutomaticChange(address.source) ? (
                    <SyncIcon fontSize="small" />
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2">
                    {formatAddress(address)}
                  </Typography>
                  {address.previous && (
                    <Typography variant="body2" color="text.secondary">
                      {t('Was:')} {formatAddress(address.previous)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatChangeMadeBy(address, userData?.user.id, t)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {!onMailingAddressesPage && (
          <Link
            component={NextLink}
            href={`/accountLists/${accountListId}/tools/mailingAddresses?mailingTab=history`}
            underline="none"
            fontWeight="bold"
            variant="body2"
            textTransform="uppercase"
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            {t('See changes for all partners')}
            <ArrowForwardIcon fontSize="small" />
          </Link>
        )}
        <Box flex={1} />
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          disabled={!addresses.length}
          onClick={() =>
            downloadAddressHistory(
              addresses,
              contact?.name ?? '',
              userData?.user.id,
              t,
              locale,
            )
          }
        >
          <b>{t('Export')}</b>
        </Button>
        <Button onClick={handleClose} variant="contained">
          <b>{t('Done')}</b>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
