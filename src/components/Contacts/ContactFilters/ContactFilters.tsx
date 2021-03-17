import { QueryLazyOptions } from '@apollo/client';
import { colors } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
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
  style: CSSProperties;
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
      <button onClick={() => loadFilters()}>Load Filters</button>
      {error && <p>Error: {error.toString()}</p>}
      {loading ? (
        <p>Loading Filters</p>
      ) : !data?.contactFilters ? (
        <p>No filters</p>
      ) : (
        <ul>
          {data.contactFilters.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactFilters;
