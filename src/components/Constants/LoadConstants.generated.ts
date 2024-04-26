import * as Types from '../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LoadConstantsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type LoadConstantsQuery = { __typename?: 'Query' } & {
  constant: { __typename?: 'Constant' } & {
    activities?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    languages?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    locales?: Types.Maybe<
      Array<
        { __typename?: 'Locale' } & Pick<
          Types.Locale,
          'englishName' | 'nativeName' | 'shortName'
        >
      >
    >;
    likelyToGiveOptions?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    locations?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id'>>
    >;
    pledgeCurrencies?: Types.Maybe<
      Array<
        { __typename?: 'Currency' } & Pick<
          Types.Currency,
          'codeSymbolString' | 'name' | 'code'
        >
      >
    >;
    pledgeFrequencies?: Types.Maybe<
      Array<
        { __typename?: 'IdKeyValue' } & Pick<
          Types.IdKeyValue,
          'id' | 'key' | 'value'
        >
      >
    >;
    pledgesReceived?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    preferredContactMethods?: Types.Maybe<
      Array<
        { __typename?: 'IdKeyValue' } & Pick<Types.IdKeyValue, 'id' | 'value'>
      >
    >;
    sendAppeals?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    sendNewsletterOptions?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    statuses?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
    times?: Types.Maybe<
      Array<{ __typename?: 'Time' } & Pick<Types.Time, 'key' | 'value'>>
    >;
  };
};

export const LoadConstantsDocument = gql`
  query LoadConstants {
    constant {
      activities {
        id
        value
      }
      languages {
        id
        value
      }
      locales {
        englishName
        nativeName
        shortName
      }
      likelyToGiveOptions {
        id
        value
      }
      locations {
        id
      }
      pledgeCurrencies {
        codeSymbolString
        name
        code
      }
      pledgeFrequencies {
        id
        key
        value
      }
      pledgesReceived {
        id
        value
      }
      preferredContactMethods {
        id
        value
      }
      sendAppeals {
        id
        value
      }
      sendNewsletterOptions {
        id
        value
      }
      statuses {
        id
        value
      }
      times {
        key
        value
      }
    }
  }
`;
export function useLoadConstantsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    LoadConstantsQuery,
    LoadConstantsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LoadConstantsQuery, LoadConstantsQueryVariables>(
    LoadConstantsDocument,
    options,
  );
}
export function useLoadConstantsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoadConstantsQuery,
    LoadConstantsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LoadConstantsQuery, LoadConstantsQueryVariables>(
    LoadConstantsDocument,
    options,
  );
}
export type LoadConstantsQueryHookResult = ReturnType<
  typeof useLoadConstantsQuery
>;
export type LoadConstantsLazyQueryHookResult = ReturnType<
  typeof useLoadConstantsLazyQuery
>;
export type LoadConstantsQueryResult = Apollo.QueryResult<
  LoadConstantsQuery,
  LoadConstantsQueryVariables
>;
