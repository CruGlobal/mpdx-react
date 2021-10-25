import { Box } from '@material-ui/core';
import React from 'react';
import Loading from '../../Loading';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { ContactFlowColumn } from './ContactFlowColumn';
import { useGetUserOptionsQuery } from './GetUserOptions.generated';

interface Props {
  accountListId: string;
  onContactSelected: (contactId: string) => void;
}

const statusMap: { [key: string]: string } = {
  'Never Contacted': 'NEVER_CONTACTED',
  'Ask in Future': 'ASK_IN_FUTURE',
  'Cultivate Relationship': 'CULTIVATE_RELATIONSHIP',
  'Contact for Appointment': 'CONTACT_FOR_APPOINTMENT',
  'Appointment Scheduled': 'APPOINTMENT_SCHEDULED',
  'Call for Decision': 'CALL_FOR_DECISION',
  'Partner - Financial': 'PARTNER_FINANCIAL',
  'Partner - Special': 'PARTNER_SPECIAL',
  'Partner - Pray': 'PARTNER_PRAY',
  'Not Interested': 'NOT_INTERESTED',
  Unresponsive: 'UNRESPONSIVE',
  'Never Ask': 'NEVER_ASK',
  'Research Abandoned': 'RESEARCH_ABANDONED',
  'Expired Referral': 'EXPIRED_REFERRAL',
};

const colorMap: { [key: string]: string } = {
  'color-danger': 'red',
  'color-warning': theme.palette.progressBarYellow.main,
  'color-success': theme.palette.mpdxGreen.main,
  'color-info': theme.palette.mpdxBlue.main,
  'color-text': theme.palette.cruGrayDark.main,
};

export const ContactFlow: React.FC<Props> = ({
  accountListId,
  onContactSelected,
}: Props) => {
  const {
    data: userOptions,
    loading: loadingUserOptions,
  } = useGetUserOptionsQuery({});

  const flowOptions: {
    name: string;
    statuses: string[];
    color: string;
  }[] = JSON.parse(
    userOptions?.userOptions.find((option) => option.key === 'flows')?.value ||
      '{}',
  );
  return (
    <>
      {loadingUserOptions ? (
        <Loading loading={loadingUserOptions} />
      ) : (
        <>
          {flowOptions && (
            <Box
              display="grid"
              minWidth="100%"
              gridTemplateColumns={`repeat(${flowOptions.length}, ${
                flowOptions.length > 5
                  ? '1fr'
                  : 'minmax(0, 1fr)); minmax(0, 1fr)'
              }`}
              gridAutoFlow="column"
              gridGap={theme.spacing(1)}
              overflow="auto"
              style={{ overflowX: 'auto' }}
            >
              {flowOptions.map((column) => (
                <Box
                  width={'100%'}
                  // If there are more than five columns give them a fixed width
                  // otherwise fit them equally into the screen
                  minWidth={flowOptions.length > 5 ? 360 : '100%'}
                  p={2}
                  key={column.name}
                >
                  <ContactFlowColumn
                    accountListId={accountListId}
                    title={column.name}
                    color={colorMap[column.color]}
                    onContactSelected={onContactSelected}
                    statuses={column.statuses.map(
                      (status) => statusMap[status] as ContactFilterStatusEnum,
                    )}
                  />
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </>
  );
};
