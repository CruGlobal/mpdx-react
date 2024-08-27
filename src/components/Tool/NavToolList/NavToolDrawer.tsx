import React, { ReactElement } from 'react';
import NavToolList from './NavToolList';

export interface Props {
  open: boolean;
  toggle: (isOpen: boolean) => void;
  selectedId?: string;
}

const NavToolDrawer = ({ open, toggle, selectedId }: Props): ReactElement => {
  return (
    <NavToolList selectedId={selectedId || ''} open={open} toggle={toggle} />
  );
};

export default NavToolDrawer;
