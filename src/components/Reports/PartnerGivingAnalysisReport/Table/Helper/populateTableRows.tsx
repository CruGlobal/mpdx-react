import NextLink from 'next/link';
import { Checkbox, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { RenderCell } from '../Table';

export const populateTableRows = (
  locale: string,
  onSelectOne: (contactId: string) => void,
  isRowChecked: (contactId: string) => boolean,
) => {
  const { buildContactUrl } = useContactPanel();

  const checkbox: RenderCell = ({ row }) => {
    return (
      <Checkbox
        checked={isRowChecked(row.id)}
        onChange={() => onSelectOne(row.id)}
        value={row.id}
      />
    );
  };

  const name: RenderCell = ({ row }) => {
    return (
      <Link
        component={NextLink}
        href={buildContactUrl(row.id)}
        onMouseEnter={preloadContactsRightPanel}
        style={{
          whiteSpace: 'nowrap',
          marginRight: theme.spacing(0.5),
        }}
      >
        {row.name}
      </Link>
    );
  };

  const status: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.status}
      </Typography>
    );
  };

  const pledgeAmount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.pledgeAmount ?? 0, row.pledgeCurrency, locale)}
      </Typography>
    );
  };

  const donationPeriodSum: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.donationPeriodSum ?? 0, row.pledgeCurrency, locale)}
      </Typography>
    );
  };

  const donationPeriodCount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.donationPeriodCount}
      </Typography>
    );
  };

  const donationPeriodAverage: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(
          row.donationPeriodAverage ?? 0,
          row.pledgeCurrency,
          locale,
        )}
      </Typography>
    );
  };

  const lastDonationAmount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(
          row.lastDonationAmount ?? 0,
          row.lastDonationCurrency,
          locale,
        )}
      </Typography>
    );
  };

  const lastDonationDate: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {dateFormatShort(DateTime.fromISO(row.lastDonationDate ?? ''), locale)}
      </Typography>
    );
  };

  const totalDonations: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.totalDonations ?? 0, row.pledgeCurrency, locale)}
      </Typography>
    );
  };

  return {
    checkbox,
    name,
    status,
    pledgeAmount,
    donationPeriodSum,
    donationPeriodCount,
    donationPeriodAverage,
    lastDonationAmount,
    lastDonationDate,
    totalDonations,
  };
};
