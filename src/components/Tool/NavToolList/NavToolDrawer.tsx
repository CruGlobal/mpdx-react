import React, { ReactElement } from 'react';
import NavToolList from './NavToolList';

export interface Props {
  isOpen: boolean;
  toggle: (isOpen: boolean) => void;
  selectedId?: string;
}

const NavToolDrawer = ({ isOpen, toggle, selectedId }: Props): ReactElement => {
  return (
    <NavToolList
      selectedId={selectedId || ''}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};

export default NavToolDrawer;
