import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AppointmentResultsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  endDate?: Types.InputMaybe<Types.Scalars['String']['input']>;
  range: Types.Scalars['String']['input'];
}>;

export type AppointmentResultsQuery = { __typename?: 'Query' } & {
  appointmentResults: Array<
    { __typename?: 'ReportsAppointmentResultsPeriod' } & Pick<
      Types.ReportsAppointmentResultsPeriod,
      | 'id'
      | 'startDate'
      | 'appointmentsScheduled'
      | 'individualAppointments'
      | 'monthlyDecrease'
      | 'monthlyIncrease'
      | 'newMonthlyPartners'
      | 'newSpecialPledges'
      | 'specialGifts'
    >
  >;
};

export const AppointmentResultsDocument = gql`
  query AppointmentResults(
    $accountListId: ID!
    $endDate: String
    $range: String!
  ) {
    appointmentResults(
      accountListId: $accountListId
      endDate: $endDate
      range: $range
    ) {
      id
      startDate
      appointmentsScheduled
      individualAppointments
      monthlyDecrease
      monthlyIncrease
      newMonthlyPartners
      newSpecialPledges
      specialGifts
    }
  }
`;
export function useAppointmentResultsQuery(
  baseOptions: Apollo.QueryHookOptions<
    AppointmentResultsQuery,
    AppointmentResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    AppointmentResultsQuery,
    AppointmentResultsQueryVariables
  >(AppointmentResultsDocument, options);
}
export function useAppointmentResultsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AppointmentResultsQuery,
    AppointmentResultsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AppointmentResultsQuery,
    AppointmentResultsQueryVariables
  >(AppointmentResultsDocument, options);
}
export type AppointmentResultsQueryHookResult = ReturnType<
  typeof useAppointmentResultsQuery
>;
export type AppointmentResultsLazyQueryHookResult = ReturnType<
  typeof useAppointmentResultsLazyQuery
>;
export type AppointmentResultsQueryResult = Apollo.QueryResult<
  AppointmentResultsQuery,
  AppointmentResultsQueryVariables
>;
