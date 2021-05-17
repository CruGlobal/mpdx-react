import { Box, styled, Typography } from '@material-ui/core';
import {
  CheckCircleOutline,
  Clear,
  DateRangeOutlined,
  FiberManualRecordOutlined,
} from '@material-ui/icons';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../../lib/intlFormat';
import { HandshakeIcon } from '../../ContactDetailsHeader/ContactHeaderSection/HandshakeIcon';
import { ContactDonorAccountsFragment } from '../ContactDonationsTab.generated';

const IconAndTextContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0, 4),
  display: 'flex',
  padding: 0,
}));

const IconAndTextContainerCenter = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0, 4),
  display: 'flex',
  alignItems: 'center',
  padding: 0,
}));

const LabelsAndText = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  padding: 0,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: '20',
  height: '20',
  margin: theme.spacing(0),
}));

const PartnershipInfoContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const PartnershipTitle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1),
}));

interface PartnershipInfoProp {
  contact: ContactDonorAccountsFragment | null;
}

export const PartnershipInfo: React.FC<PartnershipInfoProp> = ({ contact }) => {
  const { t } = useTranslation();

  return (
    <PartnershipInfoContainer>
      <PartnershipTitle variant="h6" role="textbox">
        {t('Partnership')}
      </PartnershipTitle>
      <IconAndTextContainer>
        <IconContainer>
          <HandshakeIcon />
        </IconContainer>
        <Box style={{ margin: 0, padding: 0 }}>
          <LabelsAndText variant="subtitle1">{contact?.status}</LabelsAndText>
          <LabelsAndText variant="subtitle1">
            {`${contact?.pledgeAmount} ${contact?.pledgeCurrency} ${contact?.pledgeFrequency}`}
          </LabelsAndText>
          <LabelsAndText variant="subtitle1">{contact?.source}</LabelsAndText>
        </Box>
      </IconAndTextContainer>
      <IconAndTextContainerCenter>
        <IconContainer>
          {contact?.pledgeReceived ? (
            <CheckCircleOutline color="disabled" style={{ margin: 8 }} />
          ) : (
            <FiberManualRecordOutlined color="disabled" style={{ margin: 8 }} />
          )}
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Commitment Recieved ')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.pledgeReceived ? ' Yes' : ' No'}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <DateRangeOutlined color="disabled" style={{ margin: 8 }} />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Start Date')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.pledgeStartDate
            ? DateTime.fromISO(contact?.pledgeStartDate).toLocaleString()
            : t('No Date Available')}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <DateRangeOutlined color="disabled" style={{ margin: 8 }} />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Last Gift')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.lastDonation?.donationDate
            ? DateTime.fromISO(
                contact?.lastDonation.donationDate,
              ).toLocaleString()
            : t('No Date Available')}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <Clear style={{ color: 'transparent', margin: 8 }} />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Lifetime Gifts')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {currencyFormat(
            contact?.totalDonations ?? 0,
            contact?.pledgeCurrency ?? 'USD',
          )}
        </LabelsAndText>
      </IconAndTextContainerCenter>
    </PartnershipInfoContainer>
  );
};
