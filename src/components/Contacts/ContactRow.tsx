import { makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import { ContactRowFragment } from './ContactRow.generated';

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    width: '24px',
    height: '24px',
    left: '16px',
    background: '#9C9FA1',
  },
}));
interface Props {
  contact: ContactRowFragment;
}

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const classes = useStyles();
  return (
    <div>
      <CheckBox className={classes.checkbox} color="secondary" />
    </div>
  );
};
