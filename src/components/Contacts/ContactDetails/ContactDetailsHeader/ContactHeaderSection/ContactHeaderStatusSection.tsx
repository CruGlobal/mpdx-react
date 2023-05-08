import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CreateIcon from '@mui/icons-material/Create';
import { DateTime } from 'luxon';
import { currencyFormat } from '../../../../../lib/intlFormat';
import {
  ContactLateStatusEnum,
  ContactLateStatusLabel,
} from '../../../ContactPartnershipStatus/ContactLateStatusLabel/ContactLateStatusLabel';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import { EditPartnershipInfoModal } from '../../ContactDontationsTab/PartnershipInfo/EditPartnershipInfoModal/EditPartnershipInfoModal';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { HandshakeIcon } from './HandshakeIcon';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'src/hooks/useLanguage';

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
  const language = useLanguage();
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
        {status ? (
          <ContactHeaderSection
            icon={<HandshakeIcon />}
            rightIcon={
              <IconButton onClick={() => setEditPartnershipModalOpen(true)}>
                <CreateIcon />
              </IconButton>
            }
          >
            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="subtitle1">
                {statusText}
                {status === StatusEnum.PartnerFinancial ? (
                  <>
                    {contact?.pledgeAmount && contact?.pledgeFrequency ? (
                      <Typography variant="subtitle1">
                        {`${
                          contact.pledgeAmount && contact?.pledgeCurrency
                            ? currencyFormat(
                                contact.pledgeAmount,
                                contact.pledgeCurrency,
                                language,
                              )
                            : contact.pledgeAmount
                        } ${`- ${getLocalizedPledgeFrequency(
                          t,
                          contact.pledgeFrequency,
                        )}`}`}
                      </Typography>
                    ) : null}

                    <Typography variant="subtitle1">
                      {lateStatusEnum !== undefined && (
                        <ContactLateStatusLabel
                          lateStatusEnum={lateStatusEnum}
                          isDetail={true}
                        />
                      )}
                    </Typography>
                  </>
                ) : null}
              </Typography>
            </Box>
          </ContactHeaderSection>
        ) : (
          <Box display="flex" justifyContent="flex-end">
            <IconButton
              sx={{ margin: 1, padding: '12px' }}
              onClick={() => setEditPartnershipModalOpen(true)}
            >
              <CreateIcon />
            </IconButton>
          </Box>
        )}
        {contact && editPartnershipModalOpen ? (
          <EditPartnershipInfoModal
            contact={contact}
            handleClose={() => setEditPartnershipModalOpen(false)}
          />
        ) : null}
      </>
    );
  }
};
