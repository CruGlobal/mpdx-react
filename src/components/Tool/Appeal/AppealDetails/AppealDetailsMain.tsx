import React, { ReactElement } from 'react';
import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';
import AppealDetailsAsked from './AppealDetailsAsked';
import AppealDetailsCommitted from './AppealDetailsCommitted';
import AppealDetailsExcluded from './AppealDetailsExcluded';
import AppealDetailsFlow from './AppealDetailsFlow';
import AppealDetailsGiven from './AppealDetailsGiven';
import AppealDetailsHeader from './AppealDetailsHeader';
import AppealDetailsReceived from './AppealDetailsReceived';

export interface Row {
  id: number;
  contact: string;
  amount: string;
  date: string;
}

export interface Props {
  appeal: TestAppeal;
}

const AppealDetailsMain = ({ appeal }: Props): ReactElement => {
  const { appealState } = useAppealContext();

  const renderDetails = (): ReactElement => {
    switch (appealState.subDisplay) {
      case 'given':
        return <AppealDetailsGiven appeal={appeal} />;
      case 'received':
        return <AppealDetailsReceived appeal={appeal} />;
      case 'commited':
        return <AppealDetailsCommitted appeal={appeal} />;
      case 'asked':
        return <AppealDetailsAsked appeal={appeal} />;
      case 'excluded':
        return <AppealDetailsExcluded appeal={appeal} />;
      default:
        return <AppealDetailsReceived appeal={appeal} />;
    }
  };

  return (
    <>
      <AppealDetailsHeader appeal={appeal} />
      {appealState.display === 'default' ? (
        renderDetails()
      ) : (
        <AppealDetailsFlow appeal={appeal} />
      )}
    </>
  );
};

export default AppealDetailsMain;
