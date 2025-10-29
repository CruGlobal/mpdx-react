import NextLink from 'next/link';
import { Checkbox, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { RenderCell } from 'src/components/Reports/PartnerGivingAnalysisReport/Table/Table';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';

export const usePopulateTableRows = (
  onSelectOne: (contactId: string) => void,
  isRowChecked: (contactId: string) => boolean,
) => {
  const { buildContactUrl } = useContactPanel();
  const locale = useLocale();

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
        {currencyFormat(row.donationPeriodSum, row.pledgeCurrency, locale)}
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
        {currencyFormat(row.donationPeriodAverage, row.pledgeCurrency, locale)}
      </Typography>
    );
  };

  const donationDate = (
    dateField: 'firstDonationDate' | 'lastDonationDate',
  ): RenderCell => {
    const DonationDate: RenderCell = ({ row }) => (
      <Typography variant="body2" noWrap>
        {typeof row[dateField] === 'string' &&
          dateFormatShort(DateTime.fromISO(row[dateField]), locale)}
      </Typography>
    );
    return DonationDate;
  };

  const firstDonationDate: RenderCell = donationDate('firstDonationDate');

  const lastDonationAmount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(
          row.lastDonationAmount,
          row.lastDonationCurrency,
          locale,
        )}
      </Typography>
    );
  };

  const lastDonationDate: RenderCell = donationDate('lastDonationDate');

  const totalDonations: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.totalDonations, row.pledgeCurrency, locale)}
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
    firstDonationDate,
    lastDonationAmount,
    lastDonationDate,
    totalDonations,
  };
};
