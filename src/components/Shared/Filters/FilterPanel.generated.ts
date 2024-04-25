import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type FilterPanelGroupFragment = (
  { __typename?: 'FilterGroup' }
  & Pick<Types.FilterGroup, 'name' | 'featured'>
  & { filters: Array<(
    { __typename: 'CheckboxFilter' }
    & Pick<Types.CheckboxFilter, 'filterKey' | 'title'>
  ) | (
    { __typename: 'DaterangeFilter' }
    & Pick<Types.DaterangeFilter, 'filterKey' | 'title'>
    & { options?: Types.Maybe<Array<(
      { __typename?: 'DateRangeOption' }
      & Pick<Types.DateRangeOption, 'name' | 'rangeEnd' | 'rangeStart'>
    )>> }
  ) | (
    { __typename: 'MultiselectFilter' }
    & Pick<Types.MultiselectFilter, 'defaultSelection' | 'filterKey' | 'title'>
    & { options?: Types.Maybe<Array<(
      { __typename?: 'FilterOption' }
      & Pick<Types.FilterOption, 'name' | 'placeholder' | 'value'>
    )>> }
  ) | (
    { __typename: 'NumericRangeFilter' }
    & Pick<Types.NumericRangeFilter, 'min' | 'minLabel' | 'max' | 'maxLabel' | 'title' | 'filterKey'>
  ) | (
    { __typename: 'RadioFilter' }
    & Pick<Types.RadioFilter, 'defaultSelection' | 'filterKey' | 'title'>
    & { options?: Types.Maybe<Array<(
      { __typename?: 'FilterOption' }
      & Pick<Types.FilterOption, 'name' | 'placeholder' | 'value'>
    )>> }
  ) | (
    { __typename: 'TextFilter' }
    & Pick<Types.TextFilter, 'filterKey' | 'title'>
    & { options?: Types.Maybe<Array<(
      { __typename?: 'FilterOption' }
      & Pick<Types.FilterOption, 'name' | 'placeholder' | 'value'>
    )>> }
  )> }
);

export type UserOptionFragment = (
  { __typename?: 'Option' }
  & Pick<Types.Option, 'id' | 'key' | 'value'>
);

export const FilterPanelGroupFragmentDoc = gql`
    fragment FilterPanelGroup on FilterGroup {
  name
  featured
  filters {
    __typename
    filterKey
    title
    ... on DaterangeFilter {
      options {
        name
        rangeEnd
        rangeStart
      }
    }
    ... on MultiselectFilter {
      defaultSelection
      options {
        name
        placeholder
        value
      }
    }
    ... on NumericRangeFilter {
      min
      minLabel
      max
      maxLabel
      title
    }
    ... on RadioFilter {
      defaultSelection
      options {
        name
        placeholder
        value
      }
    }
    ... on TextFilter {
      options {
        name
        placeholder
        value
      }
    }
  }
}
    `;
export const UserOptionFragmentDoc = gql`
    fragment UserOption on Option {
  id
  key
  value
}
    `;