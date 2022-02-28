import { Box } from '@material-ui/core';
import React from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import Loading from '../../Loading';
import {
  ActivityTypeEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  IdValue,
  StatusEnum,
} from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { useUpdateContactOtherMutation } from '../ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { useGetUserOptionsQuery } from './GetUserOptions.generated';
import useTaskModal from 'src/hooks/useTaskModal';

interface Props {
  accountListId: string;
  selectedFilters: ContactFilterSetInput;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
}

export interface ContactFlowOption {
  name: string;
  statuses: string[];
  color: string;
}

export const statusMap: { [key: string]: string } = {
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

const taskStatuses: { [key: string]: ActivityTypeEnum } = {
  APPOINTMENT_SCHEDULED: ActivityTypeEnum.Appointment,
  CONTACT_FOR_APPOINTMENT: ActivityTypeEnum.Call,
  CALL_FOR_DECISION: ActivityTypeEnum.Call,
};

export const colorMap: { [key: string]: string } = {
  'color-danger': theme.palette.error.main,
  'color-warning': theme.palette.progressBarYellow.main,
  'color-success': theme.palette.success.main,
  'color-info': theme.palette.mpdxBlue.main,
  'color-text': theme.palette.cruGrayDark.main,
};

export const ContactFlow: React.FC<Props> = ({
  accountListId,
  selectedFilters,
  onContactSelected,
}: Props) => {
  const {
    data: userOptions,
    loading: loadingUserOptions,
  } = useGetUserOptionsQuery({});

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();

  const flowOptions: ContactFlowOption[] = JSON.parse(
    userOptions?.userOptions.find((option) => option.key === 'flows')?.value ||
      '{}',
  );

  const [updateContactOther] = useUpdateContactOtherMutation();

  const changeContactStatus = async (
    id: string,
    status: {
      __typename?: 'IdValue' | undefined;
    } & Pick<IdValue, 'id' | 'value'>,
  ): Promise<void> => {
    const attributes = {
      id,
      status: status.id as StatusEnum,
    };
    await updateContactOther({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: () =>
        flowOptions.map((flowOption) => ({
          query: ContactsDocument,
          variables: {
            accountListId,
            contactsFilters: {
              status: flowOption.statuses.map(
                (status) => statusMap[status] as ContactFilterStatusEnum,
              ),
              ...selectedFilters,
            },
          },
        })),
    });
    enqueueSnackbar(t('Contact status info updated!'), {
      variant: 'success',
    });
    if (status.id && taskStatuses[status.id]) {
      openTaskModal({
        defaultValues: {
          activityType: taskStatuses[status.id],
          contactIds: [id],
        },
      });
    }
  };

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
                    selectedFilters={selectedFilters}
                    color={colorMap[column.color]}
                    onContactSelected={onContactSelected}
                    statuses={column.statuses.map(
                      (status) => statusMap[status] as ContactFilterStatusEnum,
                    )}
                    changeContactStatus={changeContactStatus}
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
