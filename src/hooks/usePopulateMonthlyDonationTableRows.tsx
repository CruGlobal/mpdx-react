import NextLink from 'next/link';
import { Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { RenderCell } from 'src/components/Reports/MonthlyDonationSummary/Table/Table';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';

export const usePopulateMonthlyDonationTableRows = (locale: string) => {
  const { buildContactUrl } = useContactPanel();

  const id: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.id}
      </Typography>
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

  const date: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {dateFormat(DateTime.fromISO(row.date), locale)}
      </Typography>
    );
  };

  const type: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {row.type}
      </Typography>
    );
  };

  const amount: RenderCell = ({ row }) => {
    return (
      <Typography variant="body2" noWrap>
        {currencyFormat(row.amount, 'USD', locale, { showTrailingZeros: true })}
      </Typography>
    );
  };

  return {
    id,
    name,
    date,
    type,
    amount,
  };
};
