import React, { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealHeaderInfo } from '../AppealDetails/AppealHeaderInfo/AppealHeaderInfo';
import { AppealQuery } from '../AppealDetails/AppealsMainPanel/AppealInfo.generated';
import { AppealStatusEnum } from '../AppealsContext/AppealsContext';
import { DynamicAddExcludedContactModal } from '../Modals/AddExcludedContactModal/DynamicAddExcludedContactModal';
import { DynamicDeleteAppealContactModal } from '../Modals/DeleteAppealContact/DynamicDeleteAppealContactModal';
import { DynamicDeletePledgeModal } from '../Modals/DeletePledgeModal/DynamicDeletePledgeModal';
import { useUpdateAccountListPledgeMutation } from '../Modals/PledgeModal/ContactPledge.generated';
import { DynamicPledgeModal } from '../Modals/PledgeModal/DynamicPledgeModal';
import { DynamicUpdateDonationsModal } from '../Modals/UpdateDonationsModal/DynamicUpdateDonationsModal';
import handleReceivedSnackBarNotifications from '../Shared/handleReceivedSnackBarNotifications/handleReceivedSnackBarNotifications';
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { ContactFlowDragLayer } from './ContactFlowDragLayer/ContactFlowDragLayer';
import { DraggedContact } from './ContactFlowRow/ContactFlowRow';

export interface ContactFlowProps {
  accountListId: string;
  searchTerm?: string | string[];
  appealInfo?: AppealQuery;
  appealInfoLoading: boolean;
}

export interface ContactFlowOption {
  id: string;
  name: string;
  status: AppealStatusEnum;
  color: string;
}

export const colorMap = {
  'color-danger': theme.palette.error.main,
  'color-text': theme.palette.cruGrayDark.main,
  'color-committed': theme.palette.progressBarGray.main,
  'color-given': theme.palette.progressBarYellow.main,
  'color-received': theme.palette.progressBarOrange.main,
};

const flowOptions: ContactFlowOption[] = [
  {
    id: crypto.randomUUID(),
    name: i18n.t('Excluded'),
    status: AppealStatusEnum.Excluded,
    color: colorMap['color-danger'],
  },
  {
    id: crypto.randomUUID(),
    name: i18n.t('Asked'),
    status: AppealStatusEnum.Asked,
    color: colorMap['color-text'],
  },
  {
    id: crypto.randomUUID(),
    name: i18n.t('Committed'),
    status: AppealStatusEnum.NotReceived,
    color: colorMap['color-committed'],
  },
  {
    id: crypto.randomUUID(),
    name: i18n.t('Received'),
    status: AppealStatusEnum.ReceivedNotProcessed,
    color: colorMap['color-received'],
  },
  {
    id: crypto.randomUUID(),
    name: i18n.t('Given'),
    status: AppealStatusEnum.Processed,
    color: colorMap['color-given'],
  },
];

export const ContactFlow: React.FC<ContactFlowProps> = ({
  accountListId,
  appealInfo,
  appealInfoLoading,
}: ContactFlowProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [addExcludedContactModalOpen, setAddExcludedContactModalOpen] =
    useState(false);
  const [deleteAppealContactModalOpen, setDeleteAppealContactModalOpen] =
    useState(false);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [deletePledgeModalOpen, setDeletePledgeModalOpen] = useState(false);
  const [updateDonationsModalOpen, setUpdateDonationsModalOpen] =
    useState(false);

  const [contact, setContact] = useState<DraggedContact | null>(null);
  const [selectedAppealStatus, setSelectedAppealStatus] =
    useState<AppealStatusEnum | null>(null);

  const [updateAccountListPledge] = useUpdateAccountListPledgeMutation();

  const changeContactStatus = async (
    contact: DraggedContact,
    newAppealStatus: AppealStatusEnum,
  ): Promise<void> => {
    const oldAppealStatus = contact.appealStatus;
    if (
      newAppealStatus !== AppealStatusEnum.Asked &&
      oldAppealStatus === AppealStatusEnum.Excluded
    ) {
      enqueueSnackbar(
        t(
          'Unable to move Excluded Contact here. If you want to add this Excluded contact to this appeal, please add them to Asked.',
        ),
        {
          variant: 'warning',
        },
      );
      return;
    }

    setContact(contact);
    setSelectedAppealStatus(newAppealStatus);

    switch (newAppealStatus) {
      case AppealStatusEnum.Excluded:
        setDeleteAppealContactModalOpen(true);
        break;
      case AppealStatusEnum.Asked:
        if (contact.pledge) {
          setDeletePledgeModalOpen(true);
        } else {
          setAddExcludedContactModalOpen(true);
        }
        break;
      case AppealStatusEnum.NotReceived:
      case AppealStatusEnum.ReceivedNotProcessed:
        if (contact.pledge) {
          const {
            __typename,
            status: _status,
            appeal,
            ...pledgeDetails
          } = contact.pledge;

          await updateAccountListPledge({
            variables: {
              input: {
                pledgeId: contact.pledge.id,
                attributes: {
                  ...pledgeDetails,
                  appealId: appeal.id,
                  contactId: contact.id,
                  status:
                    newAppealStatus === AppealStatusEnum.NotReceived
                      ? PledgeStatusEnum.NotReceived
                      : PledgeStatusEnum.ReceivedNotProcessed,
                },
              },
            },
            refetchQueries: ['Contacts'],
            update: (_, data) => {
              const newStatus =
                data.data?.updateAccountListPledge?.pledge.status;

              handleReceivedSnackBarNotifications({
                dbStatus: newStatus,
                selectedAppealStatus: newAppealStatus,
                t,
                enqueueSnackbar,
              });
            },
          });
        } else {
          setPledgeModalOpen(true);
        }
        break;
      case AppealStatusEnum.Processed:
        setUpdateDonationsModalOpen(true);
        break;
    }
  };

  const ref = useRef<HTMLElement | null>(null);

  return (
    <>
      <AppealHeaderInfo
        appealInfo={appealInfo?.appeal}
        loading={appealInfoLoading}
      />
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
                color={column.color}
                appealStatus={column.status}
                changeContactStatus={changeContactStatus}
              />
            </Box>
          ))}
        </Box>
      </DndProvider>

      {addExcludedContactModalOpen && contact && (
        <DynamicAddExcludedContactModal
          contactIds={[contact.id]}
          handleClose={() => setAddExcludedContactModalOpen(false)}
        />
      )}

      {deleteAppealContactModalOpen && contact && (
        <DynamicDeleteAppealContactModal
          contactId={contact.id}
          handleClose={() => setDeleteAppealContactModalOpen(false)}
        />
      )}

      {pledgeModalOpen && contact && (
        <DynamicPledgeModal
          contact={contact}
          pledge={contact.pledge}
          selectedAppealStatus={selectedAppealStatus}
          handleClose={() => setPledgeModalOpen(false)}
        />
      )}

      {deletePledgeModalOpen && contact && (
        <DynamicDeletePledgeModal
          pledge={contact.pledge}
          handleClose={() => setDeletePledgeModalOpen(false)}
        />
      )}

      {updateDonationsModalOpen && contact && (
        <DynamicUpdateDonationsModal
          contact={contact}
          pledge={contact.pledge}
          handleClose={() => setUpdateDonationsModalOpen(false)}
        />
      )}
    </>
  );
};
