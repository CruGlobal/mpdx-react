import { QueryLazyOptions } from '@apollo/client';
import { colors } from '@material-ui/core';
import React from 'react';
import { Exact } from '../../../../graphql/types.generated';
import { ContactFiltersQuery } from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';

interface Props {
  data: ContactFiltersQuery;
  loading: boolean;
  error: Error;
  loadFilters: (
    options?: QueryLazyOptions<Exact<{ accountListId: string }>>,
  ) => void;
}

const ContactFilters: React.FC<Props> = ({
  data,
  loading,
  error,
  loadFilters,
}: Props) => {
  return (
    <div style={{ backgroundColor: colors.amber[600] }}>
      <h2>Filters</h2>
      <button data-testID="LoadFiltersButton" onClick={() => loadFilters()}>
        Load Filters
      </button>
      {error && <p data-testID="ErrorText">Error: {error.toString()}</p>}
      {loading ? (
        <p data-testID="LoadingText">Loading Filters</p>
      ) : !data?.contactFilters ? (
        <p data-testID="EmptyText">No filters</p>
      ) : (
        <ul data-testID="FiltersList">
          {data.contactFilters.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactFilters;
