import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { PhaseEnum } from 'pages/api/graphql-rest.page.generated';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import {
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  IdValue,
  StatusEnum,
  TaskSortEnum,
} from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import useTaskModal from 'src/hooks/useTaskModal';
import { getActivitiesByPhaseType } from 'src/utils/phases/taskActivityTypes';
import theme from '../../../theme';
import Loading from '../../Loading';
import { useUpdateContactOtherMutation } from '../ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { useHasActiveTaskLazyQuery } from './ContactFlow.generated';
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { ContactFlowDragLayer } from './ContactFlowDragLayer/ContactFlowDragLayer';
import { useGetUserOptionsQuery } from './GetUserOptions.generated';
import { getDefaultFlowOptions } from './contactFlowDefaultOptions';

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
  const { statusMap, contactStatuses } = useContactPartnershipStatuses();

  const userFlowOptions: ContactFlowOption[] = JSON.parse(
    userOptions?.userOptions.find((option) => option.key === 'flows')?.value ||
      '[]',
  );

  const flowOptions = useMemo(() => {
    if (userFlowOptions.length) {
      return userFlowOptions;
    }

    return getDefaultFlowOptions(t, contactStatuses);
  }, [userFlowOptions]);

  const [updateContactOther] = useUpdateContactOtherMutation();
  const [hasActiveTask] = useHasActiveTaskLazyQuery();

  const changeContactStatus = async (
    id: string,
    status: {
      __typename?: 'IdValue' | undefined;
    } & Pick<IdValue, 'id' | 'value'>,
    contactPhase?: PhaseEnum | null,
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

    if (
      contactPhase &&
      contactPhase !== PhaseEnum.Connection &&
      contactPhase !== PhaseEnum.Archive
    ) {
      await hasActiveTask({
        variables: {
          accountListId,
          sortBy: TaskSortEnum.StartAtAsc,
          first: 1,
          tasksFilter: {
            completed: false,
            contactIds: [id],
            activityType: contactPhase
              ? getActivitiesByPhaseType(contactPhase)
              : [],
          },
        },
        onCompleted(data) {
          const taskId = data.tasks.nodes[0].id || undefined;
          if (taskId) {
            openTaskModal({
              view: TaskModalEnum.Complete,
              taskId,
            });
          }
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
