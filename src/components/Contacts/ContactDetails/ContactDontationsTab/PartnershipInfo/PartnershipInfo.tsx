import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Clear from '@mui/icons-material/Clear';
import CreateIcon from '@mui/icons-material/Create';
import DateRangeOutlined from '@mui/icons-material/DateRangeOutlined';
import FiberManualRecordOutlined from '@mui/icons-material/FiberManualRecordOutlined';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../../lib/intlFormat';
import { HandshakeIcon } from '../../ContactDetailsHeader/ContactHeaderSection/HandshakeIcon';
import { ContactDonorAccountsFragment } from '../ContactDonationsTab.generated';
import { EditPartnershipInfoModal } from './EditPartnershipInfoModal/EditPartnershipInfoModal';
import { useLoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';

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
  width: '100%',
  margin: theme.spacing(1),
}));

const PartnershipTitle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const PartnershipEditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
}));

const ClearIcon = styled(Clear)(({ theme }) => ({
  color: 'transparent',
  margin: theme.spacing(1),
}));

interface PartnershipInfoProp {
  contact: ContactDonorAccountsFragment | null;
}

export const PartnershipInfo: React.FC<PartnershipInfoProp> = ({ contact }) => {
  const { t } = useTranslation();
  const { data } = useLoadConstantsQuery();
  const constants = data?.constant;
  const [status, setStatus] = React.useState(
    constants?.statuses?.find(({ id }) => id === contact?.status),
  );

  React.useEffect(() => {
    setStatus(constants?.statuses?.find(({ id }) => id === contact?.status));
  }, [data?.constant]);

  const [editPartnershipModalOpen, setEditPartnershipModalOpen] =
    useState(false);

  return (
    <PartnershipInfoContainer>
      <Box display="flex" justifyContent="space-between">
        <PartnershipTitle variant="h6">{t('Partnership')}</PartnershipTitle>
        <IconButton
          sx={{ margin: 1 }}
          onClick={() => setEditPartnershipModalOpen(true)}
          aria-label={t('Edit Icon')}
        >
          <PartnershipEditIcon />
        </IconButton>
      </Box>
      <IconAndTextContainer>
        <IconContainer>
          <HandshakeIcon />
        </IconContainer>
        <Box style={{ margin: 0, padding: 0 }} role="cell">
          <LabelsAndText variant="subtitle1">
            {contact?.status ? status?.value : t('No Status')}
          </LabelsAndText>
          <LabelsAndText variant="subtitle1">
            {`${currencyFormat(
              contact?.pledgeAmount ?? 0,
              contact?.pledgeCurrency ?? 'USD',
            )} - ${
              getLocalizedPledgeFrequency(t, contact?.pledgeFrequency) ??
              t('No Frequency Set')
            }`}
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
          {contact?.pledgeReceived ? t('Yes') : t('No')}
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
          {t('Last Gift Date')}
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
          <ClearIcon />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Last Gift Amount')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact &&
            contact.lastDonation &&
            currencyFormat(
              contact.lastDonation.amount.amount,
              contact.lastDonation.amount.currency,
            )}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <ClearIcon />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Method')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.lastDonation?.paymentMethod}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <ClearIcon />
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
      <IconAndTextContainerCenter>
        <IconContainer>
          <ClearIcon />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Referred by ')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.contactReferralsToMe.nodes
            .map((referral) => {
              return referral.referredBy.name;
            })
            .toLocaleString()}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <ClearIcon />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Send Appeals')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1">
          {contact?.noAppeals ? t('No') : t('Yes')}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      <IconAndTextContainerCenter>
        <IconContainer>
          <ClearIcon />
        </IconContainer>
        <LabelsAndText variant="subtitle1" color="textSecondary">
          {t('Next Increase Ask')}
        </LabelsAndText>
        <LabelsAndText variant="subtitle1" role="textbox">
          {contact?.nextAsk &&
            DateTime.fromISO(contact.nextAsk).toLocaleString()}
        </LabelsAndText>
      </IconAndTextContainerCenter>
      {contact && editPartnershipModalOpen ? (
        <EditPartnershipInfoModal
          handleClose={() => setEditPartnershipModalOpen(false)}
          contact={contact}
        />
      ) : null}
    </PartnershipInfoContainer>
  );
};
