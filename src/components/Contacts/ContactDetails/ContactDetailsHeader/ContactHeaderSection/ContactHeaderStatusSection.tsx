import { Box, IconButton, styled, Typography } from '@material-ui/core';
import React, { useMemo } from 'react';
import { Skeleton } from '@material-ui/lab';
import { DateTime } from 'luxon';
import CreateIcon from '@material-ui/icons/Create';
import { currencyFormat } from '../../../../../lib/intlFormat';
import { PledgeFrequencyEnum } from '../../../ContactPartnershipStatus/ContactPartnershipStatus';
import {
  ContactLateStatusEnum,
  ContactLateStatusLabel,
} from '../../../ContactPartnershipStatus/ContactLateStatusLabel/ContactLateStatusLabel';
import { StatusEnum } from '../../../../../../graphql/types.generated';
import { ContactHeaderSection } from './ContactHeaderSection';
import { ContactHeaderStatusFragment } from './ContactHeaderStatus.generated';
import { HandshakeIcon } from './HandshakeIcon';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';

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
  const status = contact?.status;

  const lateStatusEnum: number | undefined = useMemo(() => {
    if (contact?.lateAt) {
      const diff = DateTime.now().diff(DateTime.fromISO(contact.lateAt), 'days')
        ?.days;

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
          <ContactHeaderSection icon={<HandshakeIcon />}>
            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <>
                <Typography variant="subtitle1">
                  {statusText}
                  {status === StatusEnum.PartnerFinancial ? (
                    <>
                      <Typography variant="subtitle1">
                        {`${
                          contact?.pledgeAmount && contact?.pledgeCurrency
                            ? currencyFormat(
                                contact?.pledgeAmount,
                                contact?.pledgeCurrency,
                              )
                            : contact?.pledgeAmount
                        } ${
                          contact?.pledgeFrequency &&
                          `- ${PledgeFrequencyEnum[contact?.pledgeFrequency]}`
                        }`}
                      </Typography>
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
              </>
              <IconButton style={{ padding: 0 }}>
                <CreateIcon />
              </IconButton>
            </Box>
          </ContactHeaderSection>
        ) : (
          <Box display="flex" justifyContent="flex-end">
            <IconButton style={{ padding: 12 }}>
              <CreateIcon />
            </IconButton>
          </Box>
        )}
      </>
    );
  }
};
