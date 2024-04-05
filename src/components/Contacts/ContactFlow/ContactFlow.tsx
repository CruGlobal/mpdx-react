import React from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ActivityTypeEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  IdValue,
  StatusEnum,
} from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from '../../../theme';
import Loading from '../../Loading';
import { useUpdateContactOtherMutation } from '../ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { ContactFlowDragLayer } from './ContactFlowDragLayer/ContactFlowDragLayer';
import { useGetUserOptionsQuery } from './GetUserOptions.generated';

interface Props {
  accountListId: string;
  selectedFilters: ContactFilterSetInput;
  searchTerm?: string | string[];
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
}

export interface ContactFlowOption {
  id: string;
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
  searchTerm,
}: Props) => {
  const { data: userOptions, loading: loadingUserOptions } =
    useGetUserOptionsQuery({});

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();

  const flowOptions: ContactFlowOption[] = JSON.parse(
    userOptions?.userOptions.find((option) => option.key === 'flows')?.value ||
      '[]',
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
        view: 'add',
        defaultValues: {
          activityType: taskStatuses[status.id],
          contactIds: [id],
        },
      });
    }
  };

  return loadingUserOptions ? (
    <Loading loading={loadingUserOptions} />
  ) : (
    flowOptions && (
      <DndProvider backend={HTML5Backend}>
        <ContactFlowDragLayer />
        <Box
          display="grid"
          minWidth="100%"
          gridTemplateColumns={`repeat(${flowOptions.length}, minmax(300px, 1fr)); minmax(300px, 1fr)`}
          gridAutoFlow="column"
          gap={theme.spacing(1)}
          overflow="auto"
          style={{ overflowX: 'auto' }}
          gridAutoColumns="300px"
          data-testid="contactsFlow"
        >
          {flowOptions.map((column) => (
            <Box
              width={'100%'}
              minWidth={300}
              p={2}
              key={column.name}
              data-testid={`contactsFlow${column.name}`}
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
                searchTerm={searchTerm}
              />
            </Box>
          ))}
        </Box>
      </DndProvider>
    )
  );
};
