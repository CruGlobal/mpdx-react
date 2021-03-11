import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';

interface Props {
  style: CSSProperties;
}

const ContactsHeader: React.FC<Props> = ({ style }: Props) => {
  return <div color={'#0000ff'} style={style} />;
};

export default ContactsHeader;
