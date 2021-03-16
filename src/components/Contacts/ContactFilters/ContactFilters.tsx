import { colors } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';

interface Props {
  style: CSSProperties;
}

const ContactFilters: React.FC<Props> = ({ style }: Props) => {
  return (
    <div style={{ ...style, backgroundColor: colors.amber[600] }}>
      {/*<h2>Filters</h2>
      <button onClick={() => loadContactFilters()}>Load Filters</button>
      {contactFiltersError && <p>Error: {contactFiltersError.toString()}</p>}
      {contactFiltersLoading ? (
        <p>Loading Filters</p>
      ) : !contactFilters?.contactFilters ? (
        <p>No filters</p>
      ) : (
        <ul>
          {contactFilters.contactFilters.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      )}*/}
    </div>
  );
};

export default ContactFilters;
