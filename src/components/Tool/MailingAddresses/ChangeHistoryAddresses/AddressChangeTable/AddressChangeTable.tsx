import NextLink from 'next/link';
import React, { forwardRef, useMemo } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Box,
  Button,
  CircularProgress,
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
import { TableVirtuoso, TableVirtuosoProps } from 'react-virtuoso';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import {
  formatAddress,
  formatChangeMadeBy,
  isAutomaticChange,
} from 'src/components/Shared/AddressHistoryModal/addressHistoryHelpers';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { dateFormat } from 'src/lib/intlFormat';
import { AddressChangeRow } from '../helpers';

const Scroller = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <TableContainer ref={ref} {...props} />);
Scroller.displayName = 'Scroller';

const Body = forwardRef<HTMLTableSectionElement>((props, ref) => (
  <TableBody {...props} ref={ref} />
));
Body.displayName = 'Body';

interface AddressChangeTableProps {
  addressChanges: AddressChangeRow[];
  loadingMore: boolean;
  onEndReached: () => void;
  onHistoryClick: (addressChange: AddressChangeRow) => void;
}

export const AddressChangeTable: React.FC<AddressChangeTableProps> = ({
  addressChanges,
  loadingMore,
  onEndReached,
  onHistoryClick,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { buildContactUrl } = useContactPanel();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { data: userData } = useGetUserQuery();
  const currentUserId = userData?.user.id;

  const components: TableVirtuosoProps<
    AddressChangeRow,
    unknown
  >['components'] = useMemo(
    () => ({
      Scroller,
      Table: (props) => (
        <Table
          {...props}
          aria-label={t('Address changes')}
          sx={{
            tableLayout: 'fixed',
            minWidth: 730,
            '& .MuiTableCell-head': {
              fontWeight: 'bold',
              backgroundColor: 'background.paper',
            },
            '& .MuiTableCell-body': { verticalAlign: 'top' },
          }}
        />
      ),
      TableHead,
      TableBody: Body,
      TableRow,
    }),
    [t],
  );

  return (
    <>
      <TableVirtuoso
        data={addressChanges}
        components={components}
        endReached={onEndReached}
        style={{
          height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight} - 360px)`,
          minHeight: 300,
        }}
        fixedHeaderContent={() => (
          <TableRow>
            <TableCell sx={{ width: '15%' }}>{t('Date')}</TableCell>
            <TableCell sx={{ width: '22%' }}>{t('Partner')}</TableCell>
            <TableCell sx={{ width: '33%' }}>{t('Address')}</TableCell>
            <TableCell sx={{ width: '20%' }}>{t('Made by')}</TableCell>
            <TableCell sx={{ width: '10%' }} />
          </TableRow>
        )}
        itemContent={(_, addressChange) => (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {dateFormat(DateTime.fromISO(addressChange.date), locale)}
            </TableCell>
            <TableCell>
              <Link
                component={NextLink}
                href={buildContactUrl(addressChange.contactId)}
                shallow
                fontWeight="bold"
              >
                {addressChange.partnerName}
              </Link>
              <Typography variant="body2" color="text.secondary">
                {[
                  addressChange.donorAccountNumbers &&
                    t('({{donorAccountNumbers}})', {
                      donorAccountNumbers: addressChange.donorAccountNumbers,
                    }),
                  addressChange.partnerStatus &&
                    getLocalizedContactStatus(addressChange.partnerStatus),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </TableCell>
            <TableCell>
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
            <TableCell>
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
            <TableCell align="right">
              <Button
                size="small"
                onClick={() => onHistoryClick(addressChange)}
                sx={{ fontWeight: 'bold' }}
              >
                {t('History')}
              </Button>
            </TableCell>
          </>
        )}
      />
      {loadingMore && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} data-testid="loading-more" />
        </Box>
      )}
    </>
  );
};
