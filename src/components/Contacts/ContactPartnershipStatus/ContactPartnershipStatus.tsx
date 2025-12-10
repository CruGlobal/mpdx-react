import React from 'react';
import { Box, Hidden, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { StatusEnum as ContactPartnershipStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { currencyFormat } from 'src/lib/intlFormat';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { ContactLateStatusLabel } from './ContactLateStatusLabel/ContactLateStatusLabel';
import { ContactPartnershipStatusLabel } from './ContactPartnershipStatusLabel/ContactPartnershipStatusLabel';

interface ContactPartnershipStatusProps {
  lateAt: ContactRowFragment['lateAt'];
  pledgeStartDate: ContactRowFragment['pledgeStartDate'];
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
  pledgeStartDate,
  pledgeAmount,
  pledgeCurrency,
  pledgeFrequency,
  pledgeReceived,
  status,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { isOpen: contactPanelOpen } = useContactPanel();
  const { getLocalizedPledgeFrequency } = useLocalizedConstants();

  return (
    <Box justifyContent={contactPanelOpen ? 'flex-end' : undefined}>
      <Hidden smDown>
        <Box display="flex" flexDirection="column" justifyContent="center">
          {status && <ContactPartnershipStatusLabel status={status} />}
          <Typography component="span">
            {pledgeAmount && pledgeCurrency
              ? currencyFormat(pledgeAmount, pledgeCurrency, locale)
              : pledgeAmount || ''}{' '}
            {pledgeFrequency && getLocalizedPledgeFrequency(pledgeFrequency)}{' '}
            {status === ContactPartnershipStatusEnum.PartnerFinancial && (
              <ContactLateStatusLabel
                lateAt={lateAt}
                pledgeStartDate={pledgeStartDate}
                pledgeFrequency={pledgeFrequency}
              />
            )}
          </Typography>
          {pledgeReceived === false &&
            status === ContactPartnershipStatusEnum.PartnerFinancial && (
              <Typography variant="body2" color="error">
                {t('Commitment Not Received')}
              </Typography>
            )}
        </Box>
      </Hidden>
    </Box>
  );
};
