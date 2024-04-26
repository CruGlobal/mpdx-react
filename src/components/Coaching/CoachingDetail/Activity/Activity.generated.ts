import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CoachingDetailActivityQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  dateRange: Types.Scalars['String']['input'];
}>;

export type CoachingDetailActivityQuery = { __typename?: 'Query' } & {
  accountListAnalytics: { __typename?: 'AccountListAnalytics' } & {
    appointments: { __typename?: 'AppointmentsAccountListAnalytics' } & Pick<
      Types.AppointmentsAccountListAnalytics,
      'completed'
    >;
    contacts: { __typename?: 'ContactsAccountListAnalytics' } & Pick<
      Types.ContactsAccountListAnalytics,
      'active' | 'referrals' | 'referralsOnHand'
    >;
    correspondence: {
      __typename?: 'CorrespondenceAccountListAnalytics';
    } & Pick<
      Types.CorrespondenceAccountListAnalytics,
      'precall' | 'reminders' | 'supportLetters' | 'thankYous' | 'newsletters'
    >;
    electronic: { __typename?: 'ElectronicAccountListAnalytics' } & Pick<
      Types.ElectronicAccountListAnalytics,
      'appointments' | 'received' | 'sent'
    >;
    email: { __typename?: 'EmailsAccountListAnalytics' } & Pick<
      Types.EmailsAccountListAnalytics,
      'received' | 'sent'
    >;
    facebook: { __typename?: 'FacebookAccountListAnalytics' } & Pick<
      Types.FacebookAccountListAnalytics,
      'received' | 'sent'
    >;
    phone: { __typename?: 'PhoneAccountListAnalytics' } & Pick<
      Types.PhoneAccountListAnalytics,
      'attempted' | 'appointments' | 'completed' | 'received' | 'talkToInPerson'
    >;
    textMessage: { __typename?: 'TextMessageAccountListAnalytics' } & Pick<
      Types.TextMessageAccountListAnalytics,
      'received' | 'sent'
    >;
  };
};

export const CoachingDetailActivityDocument = gql`
  query CoachingDetailActivity($accountListId: ID!, $dateRange: String!) {
    accountListAnalytics(accountListId: $accountListId, dateRange: $dateRange) {
      appointments {
        completed
      }
      contacts {
        active
        referrals
        referralsOnHand
      }
      correspondence {
        precall
        reminders
        supportLetters
        thankYous
        newsletters
      }
      electronic {
        appointments
        received
        sent
      }
      email {
        received
        sent
      }
      facebook {
        received
        sent
      }
      phone {
        attempted
        appointments
        completed
        received
        talkToInPerson
      }
      textMessage {
        received
        sent
      }
    }
  }
`;
export function useCoachingDetailActivityQuery(
  baseOptions: Apollo.QueryHookOptions<
    CoachingDetailActivityQuery,
    CoachingDetailActivityQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CoachingDetailActivityQuery,
    CoachingDetailActivityQueryVariables
  >(CoachingDetailActivityDocument, options);
}
export function useCoachingDetailActivityLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CoachingDetailActivityQuery,
    CoachingDetailActivityQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CoachingDetailActivityQuery,
    CoachingDetailActivityQueryVariables
  >(CoachingDetailActivityDocument, options);
}
export type CoachingDetailActivityQueryHookResult = ReturnType<
  typeof useCoachingDetailActivityQuery
>;
export type CoachingDetailActivityLazyQueryHookResult = ReturnType<
  typeof useCoachingDetailActivityLazyQuery
>;
export type CoachingDetailActivityQueryResult = Apollo.QueryResult<
  CoachingDetailActivityQuery,
  CoachingDetailActivityQueryVariables
>;
