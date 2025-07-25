import React, { useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { PhaseEnum } from 'pages/api/graphql-rest.page.generated';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import useTaskModal from 'src/hooks/useTaskModal';
import { getActivitiesByPhaseType } from 'src/utils/phases/taskActivityTypes';
import theme from '../../../theme';
import Loading from '../../Loading';
import { useUpdateContactOtherMutation } from '../ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { useHasActiveTaskLazyQuery } from './ContactFlow.generated';
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { ContactFlowDragLayer } from './ContactFlowDragLayer/ContactFlowDragLayer';
import { getDefaultFlowOptions } from './contactFlowDefaultOptions';
import { useFlowOptions } from './useFlowOptions';

interface Props {
  accountListId: string;
}

export interface ContactFlowOption {
  id: string;
  name: string;
  statuses: StatusEnum[];
  color: string;
}

export const colorMap: { [key: string]: string } = {
  'color-danger': theme.palette.error.main,
  'color-warning': theme.palette.progressBarYellow.main,
  'color-success': theme.palette.success.main,
  'color-info': theme.palette.mpdxBlue.main,
  'color-text': theme.palette.cruGrayDark.main,
};

export const ContactFlow: React.FC<Props> = ({ accountListId }: Props) => {
  const [userFlowOptions, _, { loading: loadingUserOptions }] =
    useFlowOptions();

  const { t } = useTranslation();
  const { getContactStatusesByPhase } = useContactPartnershipStatuses();
  const { getLocalizedPhase } = useLocalizedConstants();
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();

  const flowOptions = useMemo(() => {
    if (loadingUserOptions) {
      return [];
    }
    if (userFlowOptions.length) {
      return userFlowOptions;
    }

    return getDefaultFlowOptions(
      t,
      getContactStatusesByPhase,
      getLocalizedPhase,
    );
  }, [userFlowOptions, loadingUserOptions]);

  const [updateContactOther] = useUpdateContactOtherMutation();
  const [hasActiveTask] = useHasActiveTaskLazyQuery();

  const changeContactStatus = async (
    id: string,
    status: StatusEnum,
    contactPhase: PhaseEnum | null | undefined,
  ): Promise<void> => {
    const attributes = {
      id,
      status,
    };
    const { data } = await updateContactOther({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: [ContactsDocument],
    });
    enqueueSnackbar(t('Contact status updated!'), {
      variant: 'success',
    });

    const newContactPhase = data?.updateContact?.contact.contactPhase;

    switch (contactPhase) {
      case PhaseEnum.Initiation:
      case PhaseEnum.Appointment:
      case PhaseEnum.FollowUp:
      case PhaseEnum.PartnerCare:
        const { data } = await hasActiveTask({
          variables: {
            accountListId,
            tasksFilter: {
              completed: false,
              contactIds: [id],
              activityType: contactPhase
                ? getActivitiesByPhaseType(contactPhase)
                : [],
            },
          },
        });

        const taskId = data?.tasks.nodes[0]?.id || undefined;
        if (taskId) {
          openTaskModal({
            view: TaskModalEnum.Complete,
            taskId,
            showFlowsMessage: true,
          });
        } else if (
          newContactPhase &&
          newContactPhase !== PhaseEnum.Connection &&
          newContactPhase !== PhaseEnum.Archive
        ) {
          openTaskModal({
            view: TaskModalEnum.Log,
            showFlowsMessage: true,
            defaultValues: {
              taskPhase: contactPhase,
              contactIds: [id],
            },
          });
        }
        break;

      case PhaseEnum.Connection:
        if (
          newContactPhase &&
          newContactPhase !== PhaseEnum.Connection &&
          newContactPhase !== PhaseEnum.Archive
        ) {
          openTaskModal({
            view: TaskModalEnum.Add,
            showFlowsMessage: true,
            defaultValues: {
              taskPhase: newContactPhase,
              contactIds: [id],
            },
          });
        }
        break;

      default:
        break;
    }
  };

  const ref = useRef<HTMLElement | null>(null);

  return loadingUserOptions ? (
    <Loading loading={loadingUserOptions} />
  ) : (
    flowOptions && (
      <DndProvider backend={HTML5Backend}>
        <ContactFlowDragLayer containerRef={ref} />
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
          ref={ref}
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
                color={colorMap[column.color]}
                statuses={column.statuses}
                changeContactStatus={changeContactStatus}
              />
            </Box>
          ))}
        </Box>
      </DndProvider>
    )
  );
};
