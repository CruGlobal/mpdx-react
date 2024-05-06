import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import CreateContact from './CreateContact';

export default {
  title: 'Layouts/Primary/TopBar/Items/AddMenu/Items/CreateContact',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <CreateContact accountListId={accountListId} handleClose={() => {}} />
    </GqlMockedProvider>
  );
};

export const Error = (): ReactElement => {
  return (
    <MockedProvider mocks={[]}>
      <CreateContact accountListId={accountListId} handleClose={() => {}} />
    </MockedProvider>
  );
};
