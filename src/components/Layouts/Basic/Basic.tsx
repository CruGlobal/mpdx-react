import React, { ReactElement, ReactNode } from 'react';
import logo from '../../../images/logo.svg';
import TopBar from './TopBar';

interface Props {
  children: ReactNode;
}

const Basic = ({ children }: Props): ReactElement => {
  return (
    <>
      <TopBar>
        <img src={logo} alt="logo" />
      </TopBar>
      {children}
    </>
  );
};

export default Basic;
