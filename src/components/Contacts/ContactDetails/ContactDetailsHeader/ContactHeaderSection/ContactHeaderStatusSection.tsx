import React, { useMemo, useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import { currencyFormat } from '../../../../../lib/intlFormat';
import {
  ContactLateStatusEnum,
  ContactLateStatusLabel,
} from '../../../ContactPartnershipStatus/ContactLateStatusLabel/ContactLateStatusLabel';
import { EditPartnershipInfoModal } from '../../ContactDonationsTab/PartnershipInfo/EditPartnershipInfoModal/EditPartnershipInfoModal';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { HandshakeIcon } from './HandshakeIcon';

interface Props {
  loading: boolean;
  contact?: ContactHeaderStatusFragment;
}

const TextSkeleton = styled(Skeleton)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  width: 200,
  fontSize: 16,
}));

export const ContactHeaderStatusSection: React.FC<Props> = ({
  loading,
  contact,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const status = contact?.status;
  const [editPartnershipModalOpen, setEditPartnershipModalOpen] =
    useState(false);
  const lateStatusEnum: number | undefined = useMemo(() => {
    if (contact?.lateAt) {
      const diff = DateTime.now().diff(
        DateTime.fromISO(contact.lateAt),
        'days',
      )?.days;

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
  }, [contact?.lateAt]);

  if (loading) {
    return (
      <ContactHeaderSection icon={<HandshakeIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else {
    const statusText = status && contactPartnershipStatus[status];
    return (
      <>
        {status && (
          <ContactHeaderSection icon={<HandshakeIcon />}>
            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="subtitle1">
                {statusText}
                {status === StatusEnum.PartnerFinancial && (
                  <>
                    {contact?.pledgeAmount && contact?.pledgeFrequency && (
                      <Typography variant="subtitle1">
                        {`${
                          contact.pledgeAmount && contact?.pledgeCurrency
                            ? currencyFormat(
                                contact.pledgeAmount,
                                contact.pledgeCurrency,
                                locale,
                              )
                            : contact.pledgeAmount
                        } ${`- ${getLocalizedPledgeFrequency(
                          t,
                          contact.pledgeFrequency,
                        )}`}`}
                      </Typography>
                    )}

                    <Typography variant="subtitle1">
                      {lateStatusEnum !== undefined && (
                        <ContactLateStatusLabel
                          lateStatusEnum={lateStatusEnum}
                          isDetail={true}
                        />
                      )}
                    </Typography>
                  </>
                )}
              </Typography>
            </Box>
          </ContactHeaderSection>
        )}
        {contact && editPartnershipModalOpen && (
          <EditPartnershipInfoModal
            contact={contact}
            handleClose={() => setEditPartnershipModalOpen(false)}
          />
        )}
      </>
    );
  }
};
