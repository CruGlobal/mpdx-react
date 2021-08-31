import React, { ReactElement } from 'react';
import AppealDetailsReceived from '../../../../../src/components/Tool/Appeal/AppealDetails/AppealDetailsReceived';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';
import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import AppealDetailsHeader from './AppealDetailsHeader';
import AppealDetailsCommitted from './AppealDetailsCommitted';
import AppealDetailsGiven from './AppealDetailsGiven';
import AppealDetailsAsked from './AppealDetailsAsked';
import AppealDetailsExcluded from './AppealDetailsExcluded';
import AppealDetailsFlow from './AppealDetailsFlow';

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
