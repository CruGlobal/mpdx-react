import React, { useMemo } from 'react';
import { Box, Hidden, Typography } from '@material-ui/core';
import { DateTime } from 'luxon';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { StatusEnum as ContactPartnershipStatusEnum } from '../../../../graphql/types.generated';
import {
  ContactLateStatusEnum,
  ContactLateStatusLabel,
} from './ContactLateStatusLabel/ContactLateStatusLabel';
import { ContactPartnershipStatusIcon } from './ContactPartnershipStatusIcon/ContactPartnershipStatusIcon';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel/ContactPartnershipStatusLabel';
// import { currencyFormat } from 'src/lib/intlFormat';

export enum PledgeFrequencyEnum {
  ANNUAL = 'Annual',
  EVERY_2_MONTHS = 'Every 2 Months',
  EVERY_2_WEEKS = 'Every 2 Weeks',
  EVERY_2_YEARS = 'Every 2 Years',
  EVERY_4_MONTHS = 'Every 4 Months',
  EVERY_6_MONTHS = 'Every 6 Months',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  WEEKLY = 'Weekly',
}

interface ContactPartnershipStatusProps {
  lateAt: ContactRowFragment['lateAt'];
  contactDetailsOpen: boolean;
  pledgeAmount: ContactRowFragment['pledgeAmount'];
  pledgeCurrency: ContactRowFragment['pledgeCurrency'];
  pledgeFrequency: ContactRowFragment['pledgeFrequency'];
  status: ContactRowFragment['status'];
}

export const ContactPartnershipStatus: React.FC<ContactPartnershipStatusProps> = ({
  lateAt,
  contactDetailsOpen,
  // pledgeAmount,
  // pledgeCurrency,
  pledgeFrequency,
  status,
}) => {
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
        {status === ContactPartnershipStatusEnum.PartnerFinancial &&
          lateStatusEnum && (
            <ContactPartnershipStatusIcon lateStatusEnum={lateStatusEnum} />
          )}
      </Box>
      <Hidden
        xsUp={
          contactDetailsOpen ||
          status === ContactPartnershipStatusEnum.PartnerFinancial
        }
      >
        <Box display="flex" flexDirection="column" justifyContent="center">
          {status && <ContactPartnershipStatusLabel status={status} />}
          <Typography component="span">
            {/* {pledgeAmount && pledgeCurrency
              ? currencyFormat(pledgeAmount, pledgeCurrency)
              : pledgeAmount}{' '} */}
            {pledgeFrequency && PledgeFrequencyEnum[pledgeFrequency]}{' '}
            {status === ContactPartnershipStatusEnum.PartnerFinancial &&
              lateStatusEnum && (
                <ContactLateStatusLabel lateStatusEnum={lateStatusEnum} />
              )}
          </Typography>
        </Box>
      </Hidden>
    </Box>
  );
};
