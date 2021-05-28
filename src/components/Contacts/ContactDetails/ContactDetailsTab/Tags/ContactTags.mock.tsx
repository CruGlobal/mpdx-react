import { MockedResponse } from '@apollo/client/testing';
import {
  UpdateContactTagsDocument,
  UpdateContactTagsMutation,
} from './ContactTags.generated';

export const createContactTagMutationMock = (): MockedResponse => {
  const data: UpdateContactTagsMutation = {
    updateContact: {
      contact: {
        id: 'abc',
        tagList: ['tag1', 'tag2', 'tag3', 'tag4'],
      },
    },
  };

  return {
    request: {
      query: UpdateContactTagsDocument,
      variables: {
        accountListId: '123',
        contactId: 'abc',
        tagList: ['tag1', 'tag2', 'tag3', 'tag4'],
      },
    },
    result: {
      data,
    },
  };
};
