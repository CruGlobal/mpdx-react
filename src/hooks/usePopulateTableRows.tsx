import NextLink from 'next/link';
import { Checkbox, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { ContactDetailTabEnum } from 'src/components/Contacts/ContactDetails/ContactDetailTab';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { RenderCell } from 'src/components/Reports/PartnerGivingAnalysisReport/Table/Table';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import theme from 'src/theme';

export const usePopulateTableRows = (
  onSelectOne: (contactId: string) => void,
  isRowChecked: (contactId: string) => boolean,
) => {
  const { buildContactUrl } = useContactPanel();
  const { getLocalizedPledgeFrequency } = useLocalizedConstants();
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
        href={buildContactUrl(row.id, ContactDetailTabEnum.Donations)}
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
    const formattedAmount = currencyFormat(
      row.pledgeAmount ?? 0,
      row.pledgeCurrency,
      locale,
    );
    const displayText = row.pledgeFrequency
      ? `${formattedAmount}/${getLocalizedPledgeFrequency(row.pledgeFrequency)}`
      : formattedAmount;

    return (
      <Typography variant="body2" noWrap>
        {displayText}
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
    const date: RenderCell = ({ row }) => (
      <Typography variant="body2" noWrap>
        {typeof row[dateField] === 'string' &&
          dateFormatShort(DateTime.fromISO(row[dateField]), locale)}
      </Typography>
    );
    return date;
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
