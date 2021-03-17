import { colors } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';

interface Props {
  style: CSSProperties;
}

const ContactsHeader: React.FC<Props> = ({ style }: Props) => {
  return (
    <div style={{ ...style, backgroundColor: colors.blue[600] }}>
      {/*TODO: Work on Header content*/}
    </div>
  );
};

export default ContactsHeader;
