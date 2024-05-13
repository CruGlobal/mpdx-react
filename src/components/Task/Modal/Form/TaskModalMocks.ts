import { StatusEnum } from 'src/graphql/types.generated';
import { UpdateContactStatusDocument } from './TaskModal.generated';

export const updateContactStatusMutationMock = (
  accountListId: string,
  contactId: string,
  status: StatusEnum,
) => ({
  request: {
    query: UpdateContactStatusDocument,
    variables: {
      accountListId,
      attributes: {
        id: contactId,
        status,
      },
    },
  },
  result: {
    data: {
      updateContact: {
        contact: {
          id: contactId,
          status,
        },
      },
    },
  },
});
