import React, { useMemo } from 'react';
import { Box, Hidden, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { currencyFormat } from 'src/lib/intlFormat';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import {
  ContactLateStatusEnum,
  ContactLateStatusLabel,
} from './ContactLateStatusLabel/ContactLateStatusLabel';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel/ContactPartnershipStatusLabel';
import { ContactPledgeReceivedIcon } from './ContactPledgeReceivedIcon/ContactPledgeReceivedIcon';

interface ContactPartnershipStatusProps {
  lateAt: ContactRowFragment['lateAt'];
  contactDetailsOpen: boolean;
  pledgeAmount: ContactRowFragment['pledgeAmount'];
  pledgeCurrency: ContactRowFragment['pledgeCurrency'];
  pledgeFrequency: ContactRowFragment['pledgeFrequency'];
  pledgeReceived: ContactRowFragment['pledgeReceived'];
  status: ContactRowFragment['status'];
}

export const ContactPartnershipStatus: React.FC<
  ContactPartnershipStatusProps
> = ({
  lateAt,
  contactDetailsOpen,
  pledgeAmount,
  pledgeCurrency,
  pledgeFrequency,
  pledgeReceived,
  status,
}) => {
  const locale = useLocale();
  const { getLocalizedPledgeFrequency } = useLocalizedConstants();
  const lateStatusEnum: number | undefined = useMemo(() => {
    if (lateAt) {
      const diff = DateTime.now().diff(DateTime.fromISO(lateAt), 'days')?.days;

      if (diff < 0) {
        return ContactLateStatusEnum.OnTime;
      } else if (diff < 30) {
        return ContactLateStatusEnum.LateLessThirty;
      } else if (diff < 60) {
        return ContactLateStatusEnum.LateMoreThirty;
      } else {
        return ContactLateStatusEnum.LateMoreSixty;
      }
    }
  }, [lateAt]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={contactDetailsOpen ? 'flex-end' : undefined}
    >
      <Box display="flex" alignItems="center" width={32}>
        {status === ContactPartnershipStatusEnum.PartnerFinancial && (
          <ContactPledgeReceivedIcon pledgeReceived={pledgeReceived} />
        )}
      </Box>
      <Hidden smDown>
        <Box display="flex" flexDirection="column" justifyContent="center">
          {status && <ContactPartnershipStatusLabel status={status} />}
          <Typography component="span">
            {pledgeAmount && pledgeCurrency
              ? currencyFormat(pledgeAmount, pledgeCurrency, locale)
              : pledgeAmount || ''}{' '}
            {pledgeFrequency && getLocalizedPledgeFrequency(pledgeFrequency)}{' '}
            {status === ContactPartnershipStatusEnum.PartnerFinancial &&
              lateStatusEnum !== undefined && (
                <ContactLateStatusLabel lateStatusEnum={lateStatusEnum} />
              )}
          </Typography>
        </Box>
      </Hidden>
    </Box>
  );
};
