import React from 'react';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import {
  GetContactDetailsDocument,
  GetContactDetailsQuery,
  GetContactDetailsQueryVariables,
  useGetContactDetailsQuery,
} from './ContactDetails.generated';

interface Props {
  accountListId: string;
  contactId: string;
}

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const contactData = gqlMock<
    GetContactDetailsQuery,
    GetContactDetailsQueryVariables
  >(GetContactDetailsDocument, { variables: { accountListId, contactId } });

  const { data, loading, error } = useGetContactDetailsQuery({
    variables: { accountListId, contactId },
  });

  return (
    <div>{loading ? <p>loading</p> : <p>{contactData?.contact.name}</p>}</div>
  );
};
