import { MockedResponse } from '@apollo/client/testing';
import { ExportFormatEnum } from '../../../../../../../graphql/types.generated';
import {
  CreateExportedContactsDocument,
  CreateExportedContactsMutation,
} from './ExportPhysical.generated';

export const createExportedContactsMock = (
  format: ExportFormatEnum,
  mailing = false,
  accountListId: string,
): MockedResponse => {
  const data: CreateExportedContactsMutation = {
    exportContacts: `restAPI/contacts/exports${
      mailing ? '/mailing' : ''
    }/someRandomID.${format}`,
  };
  return {
    request: {
      query: CreateExportedContactsDocument,
      variables: {
        mailing,
        format,
        accountListId,
      },
    },
    result: { data },
  };
};
