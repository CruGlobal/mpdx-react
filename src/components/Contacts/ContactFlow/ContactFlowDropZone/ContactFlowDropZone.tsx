import { Box, Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { ContactsDocument } from '../../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  Contact,
  ContactFilterStatusEnum,
  StatusEnum,
} from '../../../../../graphql/types.generated';
import { useUpdateContactOtherMutation } from '../../ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';

interface Props {
  status: ContactFilterStatusEnum;
  accountListId: string;
}

export const ContactFlowDropZone: React.FC<Props> = ({
  status,
  accountListId,
}: Props) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    canDrop: (contact) => String(contact.status) !== String(status),
    drop: (contact: Contact) => {
      console.log(contact.status);
      String(contact.status) !== String(status)
        ? changeContactStatus(contact.id)
        : null;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));
  const [updateContactOther] = useUpdateContactOtherMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const changeContactStatus = async (id: string): Promise<void> => {
    const attributes = {
      id,
      status: (status as unknown) as StatusEnum,
    };
    await updateContactOther({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: [
        { query: ContactsDocument, variables: { accountListId } },
      ],
    });
    enqueueSnackbar(t('Contact status info updated!'), {
      variant: 'success',
    });
  };

  return (
    <Box
      key={status}
      {...{ ref: drop }}
      style={{
        border: isOver ? '3px solid gold' : '3px solid gray',
        height: '100%',
        width: '100%',
        backgroundColor: isOver ? 'white' : 'skyblue',
        display: canDrop ? 'flex' : 'none',
      }}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="h5">{status}</Typography>
    </Box>
  );
};
