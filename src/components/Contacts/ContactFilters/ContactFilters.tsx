import { CSSProperties } from '@material-ui/core/styles/withStyles';
import React from 'react';

interface Props {
  style: CSSProperties;
}

const ContactFilters: React.FC<Props> = ({ style }: Props) => {
  return <div color={'#00ff00'} style={style} />;
};

export default ContactFilters;
