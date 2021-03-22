import { colors } from '@material-ui/core';
import React from 'react';
import { useContactFiltersLazyQuery } from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';

interface Props {
  accountListId: string;
}

export const ContactFilters: React.FC<Props> = ({ accountListId }: Props) => {
  const [
    loadContactFilters,
    { data, loading, error },
  ] = useContactFiltersLazyQuery({
    variables: { accountListId: accountListId as string },
  });

  return (
    <div style={{ backgroundColor: colors.amber[600] }}>
      <h2>Filters</h2>
      <button onClick={() => loadContactFilters()}>Load Filters</button>
      {error && <p data-testID="ErrorText">Error: {error.toString()}</p>}
      {loading ? (
        <p>Loading Filters</p>
      ) : !data?.contactFilters ? (
        <p>No Filters</p>
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
