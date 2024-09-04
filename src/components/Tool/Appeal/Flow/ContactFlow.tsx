import React, { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { ContactFlowDragLayer } from 'src/components/Contacts/ContactFlow/ContactFlowDragLayer/ContactFlowDragLayer';
import {
  ContactFilterSetInput,
  PledgeStatusEnum,
} from 'src/graphql/types.generated';
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
import { ContactFlowColumn } from './ContactFlowColumn/ContactFlowColumn';
import { DraggedContact } from './ContactFlowRow/ContactFlowRow';

export interface ContactFlowProps {
  accountListId: string;
  selectedFilters: ContactFilterSetInput;
  searchTerm?: string | string[];
  appealInfo?: AppealQuery;
  appealInfoLoading: boolean;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
}

export interface ContactFlowOption {
  id: string;
  name: string;
  status: AppealStatusEnum;
  color: string;
}

export const colorMap: { [key: string]: string } = {
  'color-danger': theme.palette.error.main,
  'color-text': theme.palette.cruGrayDark.main,
  'color-committed': theme.palette.progressBarGray.main,
  'color-given': theme.palette.progressBarYellow.main,
  'color-received‌⁠': theme.palette.progressBarOrange.main,
};

const flowOptions: ContactFlowOption[] = [
  {
    id: uuidv4(),
    name: i18n.t('Excluded'),
    status: AppealStatusEnum.Excluded,
    color: colorMap['color-danger'],
  },
  {
    id: uuidv4(),
    name: i18n.t('Asked'),
    status: AppealStatusEnum.Asked,
    color: colorMap['color-text'],
  },
  {
    id: uuidv4(),
    name: i18n.t('Committed'),
    status: AppealStatusEnum.NotReceived,
    color: colorMap['color-committed'],
  },
  {
    id: uuidv4(),
    name: i18n.t('Received‌⁠'),
    status: AppealStatusEnum.ReceivedNotProcessed,
    color: colorMap['color-received‌⁠'],
  },
  {
    id: uuidv4(),
    name: i18n.t('Given'),
    status: AppealStatusEnum.Processed,
    color: colorMap['color-given'],
  },
];

export const ContactFlow: React.FC<ContactFlowProps> = ({
  accountListId,
  onContactSelected,
  searchTerm,
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

  const [contact, setContact] = useState<DraggedContact | null>(null);

  const [updateAccountListPledge] = useUpdateAccountListPledgeMutation();

  const changeContactStatus = async (
    contact: DraggedContact,
    newAppealStatus: AppealStatusEnum,
  ): Promise<void> => {
    const oldAppealStatus = contact.status;
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
    }

    setContact(contact);

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
        if (oldAppealStatus === AppealStatusEnum.Asked) {
          setPledgeModalOpen(true);
        }

        if (oldAppealStatus === AppealStatusEnum.Processed) {
          enqueueSnackbar(
            t(
              'Unable to move contact here as this gift is already proccessed.',
            ),
            {
              variant: 'warning',
            },
          );
        }

        if (!contact.pledge) {
          enqueueSnackbar(
            t(
              'Something went wrong. Please try again or contact support if the issue persists.',
            ),
            {
              variant: 'error',
            },
          );
        }

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
                status: PledgeStatusEnum.NotReceived,
              },
            },
          },
          refetchQueries: ['Contacts'], // doesn't work
          onCompleted: () => {
            enqueueSnackbar(t('Successfully moved contact to commitment'), {
              variant: 'success',
            });
          },
          onError: () => {
            enqueueSnackbar(t('Unable to move contact to commitment'), {
              variant: 'error',
            });
          },
        });

        break;
      case AppealStatusEnum.ReceivedNotProcessed:
        // eslint-disable-next-line no-console
        console.log('ReceivedNotProcessed');
        break;
      case AppealStatusEnum.Processed:
        // eslint-disable-next-line no-console
        console.log('Processed');
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('default');
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
                selectedFilters={selectedFilters}
                color={column.color}
                onContactSelected={onContactSelected}
                appealStatus={column.status}
                changeContactStatus={changeContactStatus}
                searchTerm={searchTerm}
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
          handleClose={() => setPledgeModalOpen(false)}
        />
      )}

      {deletePledgeModalOpen && contact && (
        <DynamicDeletePledgeModal
          pledge={contact.pledge}
          handleClose={() => setDeletePledgeModalOpen(false)}
        />
      )}
    </>
  );
};
